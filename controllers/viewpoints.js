const Viewpoint = require('../models/viewpoint');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const viewpoints = await Viewpoint.find({}).populate('popupText');
    res.render('viewpoints/index', { viewpoints })
}

module.exports.renderNewForm = (req, res) => {
    res.render('viewpoints/new');
}

module.exports.createViewpoint = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.viewpoint.location,
        limit: 1
    }).send()
    const viewpoint = new Viewpoint(req.body.viewpoint);
    viewpoint.geometry = geoData.body.features[0].geometry;
    viewpoint.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    viewpoint.author = req.user._id;
    await viewpoint.save();
    console.log(viewpoint);
    req.flash('success', 'Successfully made a new viewpoint!');
    res.redirect(`/viewpoints/${viewpoint._id}`)
}

module.exports.showViewpoint = async (req, res,) => {
    const viewpoint = await Viewpoint.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!viewpoint) {
        req.flash('error', 'Cannot find that viewpoint!');
        return res.redirect('/viewpoints');
    }
    res.render('viewpoints/show', { viewpoint });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const viewpoint = await Viewpoint.findById(id)
    if (!viewpoint) {
        req.flash('error', 'Cannot find that viewpoint!');
        return res.redirect('/viewpoints');
    }
    res.render('viewpoints/edit', { viewpoint });
}

module.exports.updateViewpoint = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const viewpoint = await Viewpoint.findByIdAndUpdate(id, { ...req.body.viewpoint });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    viewpoint.images.push(...imgs);
    await viewpoint.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await viewpoint.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated viewpoint!');
    res.redirect(`/viewpoints/${viewpoint._id}`)
}

module.exports.deleteViewpoint = async (req, res) => {
    const { id } = req.params;
    await viewpoint.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted viewpoint')
    res.redirect('/viewpoints');
}
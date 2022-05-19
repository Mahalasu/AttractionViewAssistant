const Viewpoint = require('../models/viewpoint');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const viewpoint = await Viewpoint.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    viewpoint.reviews.push(review);
    await review.save();
    await viewpoint.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/viewpoints/${viewpoint._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Viewpoint.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/viewpoints/${id}`);
}

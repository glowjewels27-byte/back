import User from "../models/User.js";

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user.wishlist || []);
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const hasProduct = user.wishlist.some((id) => id.toString() === productId);
  if (!hasProduct) {
    user.wishlist.push(productId);
    await user.save();
  }

  const populatedUser = await User.findById(req.user._id).populate("wishlist");
  return res.json(populatedUser.wishlist || []);
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  const populatedUser = await User.findById(req.user._id).populate("wishlist");
  return res.json(populatedUser.wishlist || []);
};

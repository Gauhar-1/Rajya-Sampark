import Cart from '../models/Cart.js';

// Get user's cart
export const getCarts = async (req, res) => {

  const { id } = req.query;

  if(!id) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  const cart = await Cart.findOne({ userId: id });
  res.status(200).json(cart);
};

// Add item to cart
 export const addCart = async (req, res) => {
  const { productId, quantity, userId , name, category, price, imageUrl } = req.body;

  if (!productId || !quantity || !userId || !name || !category || !price || !imageUrl) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let cart = await Cart.findOne({ userId: userId });
  if (!cart) {
    cart = await Cart.create({ userId: userId, items: [{  productId, quantity, name , category, price, imageUrl }] });
  } else {

     const item = cart.items.find(item => item.productId.toString() === productId);

    if (item) {
      return res.status(200).json({ message: "Item already exists in cart" });
    }

    cart.items.push({ productId, quantity, name , category, price, imageUrl });
    cart = await cart.save();
    
  }
  res.status(201).json(cart);
};

export const updateCart = async (req, res) => {
   const { productId, quantity, userId } = req.body;

  if (!productId || !userId) {
    return res.status(400).json({ message: "Missing required fields (productId, userId)" });
  }

  try{
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(item => item.productId.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if(quantity === 0){
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    }
    else{
      item.quantity = quantity;
    }

    await cart.save();

    res.status(200).json(cart);
}
catch(e){
  console.error("Update Error: ", e);
  res.status(500).json({ message: "Failed to update cart", error: e.message });

}

}
export const deleteCart = async (req, res) => {
   const { productId, userId } = req.query;

  if (!productId || !userId) {
    return res.status(400).json({ message: "Missing productId or userId" });
  }

  try{
     const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json(cart);
}
catch(err){
  console.error("Error deleting cart:", err);
  res.status(500).json({ message: "Failed to delete cart", error: err.message });
}
}



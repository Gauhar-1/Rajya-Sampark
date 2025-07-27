import Product from '../models/Product.js';

// Get all products
 export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// Add a new product
export const addProduct = async (req, res) => {
  const product = await Product.create(req.body);
  
  if(!product){
    return res.status(500).json({
      success: false,
      message : "Product not found"
    })
  }

  res.status(201).json({
    product,
    success: true,
    message: "Product is added"
  });
};

export const updateProduct = async (req, res) => {
  const { id } = req.query;
  const  data  = req.body;

  if(!id || !data) {
    return res.status(400).json({
      message : `Missing required fields: id=${id}, data=${data ? 'present' : 'missing'}`
    });
  }

  try{
    const product = await Product.findOneAndUpdate({_id : id} , {
    name: data.name,
    category: data.category,
    stock: data.stock,
    price: data.price,
    imageUrl: data.imageUrl,
    dataAiHint: data.dataAiHint,
    description: data.description,
  },
  { new: true } ).exec();


  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
      success: false
     });
  }

  res.status(200).json({
    product,
    success: true,
    message: "Product is Updated"
  });
}
catch(e){
  console.error("Update Error: ", e);
  res.status(500).json({ message: e.message });
}

}
export const deleteProduct = async (req, res) => {
  const { id } = req.query;

  if(!id) {
    return res.status(400).json({
      message: "Missing product id"
    });
  }

  try{
    const product = await Product.findOneAndDelete({_id : id}).exec();

    if (!product) {
      return res.status(404).json({
        success : false,
        message: "Product not found" });
    }

  res.status(200).json({
    success: true,
    message: "Product is Deleted"
  });
}
catch(err){
  console.error("Error deleting product:", err);
  res.status(500).json({ message: err.message});
}
}

export const getProductById = async (req, res) => {
  const { id } = req.query;

  if(!id) {
    return res.status(400).json({
      message: "Missing product id"
    });
  }

  try{
    const product = await Product.findById(id).exec();

    if (!product) {
      return res.status(404).json({
        success : false,
        message: "Product not found" });
    }

    res.status(200).json({
      product,
      success: true,
      message: "Product is fetched"
    });
  }
  catch(err){
    console.error("Error fetching product:", err);
    res.status(500).json({ message: err.message });
  }
};
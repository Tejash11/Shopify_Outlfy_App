const fetchTopRatedProducts = async () => {
    try {
        const response = await fetch('/api/top-rated-products');
        const products = await response.json();
        // Now you can display these products on your collection page
        console.log(products);
    } catch (error) {
        console.error('Failed to fetch top-rated products', error);
    }
};

fetchTopRatedProducts();

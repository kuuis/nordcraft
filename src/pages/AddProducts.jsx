import React from "react";
import { useState } from "react";
import { storage, fs } from '../config/Config'



export const AddProducts = () => {

    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        images: [],
    });

    const [imageError, setImageError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadError, setUploadError] = useState('');

    const imgTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/PNG'];
    

    const handleProductImg = (e) => {
        const selectedFiles = e.target.files;
    
        if (selectedFiles.length > 0) {
            const newImages = [...product.images];
            const newImageErrors = [...imageError];
    
            for (const selectedFile of selectedFiles) {
                if (selectedFile && imgTypes.includes(selectedFile.type)) {
                    newImages.push(selectedFile);
                } else {
                    newImageErrors.push(`Invalid file type: ${selectedFile.name}`);
                }
            }
    
            setProduct({ ...product, images: newImages });
            setImageError(newImageErrors);
        } else {
            setProduct({ ...product, images: [] });
            setImageError(['Please select an image']);
        }
    };
    


    const handleAddProducts = (e) => {
        e.preventDefault();
        const {title, description, price, images} = product;
        
        const uploadPromises = images.map((image) => {
            return new Promise((resolve, reject)=> {
                const uploadTask = storage.ref(`product-images/${image.name}`).put(image);
                uploadTask.on(
                    'state changed',
                    (snapshot) => {

                    },
                    (error)=> reject(error),
                    () => {
                        storage
                        .ref('product-images')
                        .child(image.name)
                        .getDownloadURL()
                        .then((url) => resolve(url))
                        .catch((error) => reject(error));
                    }
                );
            });
        });
        Promise.all(uploadPromises).then((imageUrls) => {
            return fs.collection('Products').add({
                title,
                description,
                price: Number(price),
                images: imageUrls,
            });
        }).then(() => {
            setSuccessMessage('Product added successfuly');
            setProduct({
                title: '',
                description: '',
                price: '',
                images:[]
            });
            document.getElementById('file').value = '';
            setImageError([]);
            setUploadError('');
            setTimeout(()=>{
                setSuccessMessage('');
            }, 1000);
        }) .catch((error) => setUploadError(error.message));
    };


    return (
        <div className="container">
            <br />
            <br />
            <h1>Add Products</h1>
            <hr />
            {successMessage && <div className="success-msg">{successMessage}</div>}
            <form autoComplete="off" className="form-group" onSubmit={handleAddProducts}>
                <label>Product Title</label>
                <input
                    type="text"
                    className="form-control"
                    required
                    onChange={(e) => setProduct({ ...product, title: e.target.value })}
                    value={product.title}
                />
                <br />
                <label>Product Description</label>
                <input
                    type="text"
                    className="form-control"
                    required
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    value={product.description}
                />
                <br />
                <label>Product Price</label>
                <input
                    type="number"
                    className="form-control"
                    required
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    value={product.price}
                />
                <br />
                <label>Upload Product Images</label>
                <input
                    type="file"
                    id="file"
                    className="form-control"
                    multiple
                    required
                    onChange={handleProductImg}
                />

                {imageError.length > 0 && (
                    <div className="error-msg">
                        {imageError.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}
                <br />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-success btn-md">
                        SUBMIT
                    </button>
                </div>
            </form>
            {uploadError && <div className="error-msg">{uploadError}</div>}
        </div>
    );
}
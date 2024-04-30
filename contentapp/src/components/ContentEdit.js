import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { updateContent } from '../graphql/mutations';
import '../App.css';  // Ensure your CSS rules are defined in this file or update the path accordingly

const ContentEdit = ({ content, onClose }) => {
    const client = generateClient();
    const [formData, setFormData] = useState({
        title: content.title,
        description: content.description,
        duration: content.duration.toString(),
        contentType: content.contentType,
        tags: content.tags,
        author: content.author,
        thumbnailURL: content.thumbnailURL,
        videoURL: content.videoURL,
        audioURL: content.audioURL,
        accessibilityFeatures: content.accessibilityFeatures,
        activeStatus: content.activeStatus,
        difficultyLevel: content.difficultyLevel,
        userRating: content.userRating
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData({
            title: content.title,
            description: content.description,
            duration: content.duration.toString(),
            contentType: content.contentType,
            tags: content.tags,
            author: content.author,
            thumbnailURL: content.thumbnailURL,
            videoURL: content.videoURL,
            audioURL: content.audioURL,
            accessibilityFeatures: content.accessibilityFeatures,
            activeStatus: content.activeStatus,
            difficultyLevel: content.difficultyLevel,
            userRating: content.userRating
        });
    }, [content]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        const input = { ...formData, id: content.id };
        try {
            await client.graphql({
                query: updateContent,
                variables: { input }
            });
            alert('Content updated successfully!');
            onClose();
        } catch (error) {
            console.error('Update content error:', error);
            alert('Error updating content. Please try again.');
        }
    };

    return (
        <div className="content-edit-container">
            <h2 className="form-heading">Edit Content</h2>
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="text-input"
                    />
                    {errors.title && <p className="error">{errors.title}</p>}
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="textarea-input"
                    />
                    {errors.description && <p className="error">{errors.description}</p>}
                </div>
                <div className="form-group">
                    <label>Duration (minutes):</label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        className="number-input"
                    />
                </div>
                <div className="form-group">
                    <label>Content Type:</label>
                    <select
                        name="contentType"
                        value={formData.contentType}
                        onChange={handleChange}
                        required
                        className="select-input"
                    >
                        <option value="Article">Article</option>
                        <option value="Video">Video</option>
                        <option value="Podcast">Podcast</option>
                        <option value="Ebook">Ebook</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tags (comma-separated):</label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="text-input"
                    />
                </div>
                <div className="form-group">
                    <label>Author:</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="text-input"
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-btn">Update Content</button>
                    <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ContentEdit;

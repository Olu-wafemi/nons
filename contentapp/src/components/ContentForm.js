import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { uploadData } from 'aws-amplify/storage';

import { createContent } from '../graphql/mutations';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import '../App.css'; // Import CSS file for styling

function ContentForm() {
    const client = generateClient();
    const [formData, setFormData] = useState({
        title: 'Sample',
        description: 'Sample Description',
        duration: '60',
        contentType: 'Article',
        contentID: uuidv4(),
        tags: 'Article',
        publishedDate: '',
        modifiedDate: '',
        author: 'Admin_Lakal',
        activeStatus: false,
        difficultyLevel: '',
        thumbnailURL: '',
        videoURL: '',
        audioURL: '',
        accessibilityFeatures: '',
        userRating: ''
    });
    const [errors, setErrors] = useState({});
    const [fileData, setFileData] = useState({
        thumbnailURL: null,
        videoURL: null,
        audioURL: null
    });
    const handleFileChange = (event) => {
        const { name, files } = event.target;
        if (files && files[0]) {
            const file = files[0];
            setFileData(prev => ({...prev, [name]: file}));
            setFormData(prev => ({...prev, [name]: file.name}));
        }
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const uploadFile = async (file) => {
        if (!file) return ''; // No file to upload
        const filename = `${uuidv4()}-${file.name}`;
        console.log("File name:", filename);
        try {
            const result  = await uploadData({
                key: filename, 
                data: file, 
                options: {
                    accessLevel: 'guest',
                }
            }).result;
            console.log(`File uploaded: s3://${result.key}`); 
            return result;
        } catch (error) {
            console.error('Error uploading file:', error);
            return '';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const keys = await Promise.all([
                uploadFile(fileData.thumbnailURL),
                uploadFile(fileData.videoURL),
                uploadFile(fileData.audioURL)
            ]);

            const [thumbnailResult, videoResult, audioResult] = keys;
            console.log(keys);
            const currentDate = new Date().toISOString();
            const input = { 
                ...formData,
                thumbnailURL: thumbnailResult ? `s3://${thumbnailResult.key}` : '',
                videoURL: videoResult ? `s3://${videoResult.key}` : '',
                audioURL: audioResult ? `s3://${audioResult.key}` : '',
                activeStatus: false, 
                contentID: uuidv4(), 
                publishedDate: currentDate, 
                modifiedDate: currentDate 
            };
            console.log(input);
            await client.graphql({ query: createContent, variables: { input } });
            alert('Content saved successfully!');
            setFormData({ ...formData, contentID: uuidv4() }); // Reset form for next submission
            setFileData({thumbnailURL: null, videoURL: null, audioURL: null});
        } catch (error) {
            alert('Error saving content. Please try again.');
            console.error('Save content error:', error);
        }
    };

    return (
        <div className="content-form-container">
            <h2>Add New Content</h2>
            <form onSubmit={handleSubmit} className="content-form">
                <div className="form-group">
                    <label>Title:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    {errors.title && <p className="error">{errors.title}</p>}
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                    {errors.description && <p className="error">{errors.description}</p>}
                </div>
                <div className="form-group">
                    <label>Duration (minutes):</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Content Type:</label>
                    <select name="contentType" value={formData.contentType} onChange={handleChange} required>
                        <option value="">Select a Content Type</option>
                        <option value="Article">Article</option>
                        <option value="Video">Video</option>
                        <option value="Podcast">Podcast</option>
                        <option value="Ebook">Ebook</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tags (comma-separated):</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Author:</label>
                    <input type="text" name="author" value={formData.author} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Thumbnail (Upload):</label>
                    <input type="file" name="thumbnailURL" onChange={handleFileChange} />
                    <span className="file-name">{formData.thumbnailURL}</span>
                </div>
                <div className="form-group">
                    <label>Video (Upload):</label>
                    <input type="file" name="videoURL" onChange={handleFileChange} />
                    <span className="file-name">{formData.videoURL}</span>
                </div>
                <div className="form-group">
                    <label>Audio (Upload):</label>
                    <input type="file" name="audioURL" onChange={handleFileChange} />
                    <span className="file-name">{formData.audioURL}</span>
                </div>
                <div className="form-group">
                    <label>Accessibility Features:</label>
                    <select name="accessibilityFeatures" value={formData.accessibilityFeatures} onChange={handleChange} required>
                        <option value="">Select Accessibility Feature</option>
                        <option value="Subtitles">Subtitles</option>
                        <option value="Sign Language">Sign Language</option>
                        <option value="Audio Description">Audio Description</option>
                        <option value="High Contrast">High Contrast</option>
                        <option value="Screen Reader Support">Screen Reader Support</option>
                    </select>
                </div>

                <button type="submit" className="submit-btn">Add Content</button>
            </form>
        </div>
    );
}

export default ContentForm;

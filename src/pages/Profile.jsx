import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../reusable-Components/utils';
import { ToastContainer } from 'react-toastify';
import '../assets/css/login.css';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        profilePicture: '	https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png',
        weight: '',
        height: '',
        gender: '',
        BMI: 0,
        calories: 0,
    });

    const navigate = useNavigate();

  useEffect(() => {
      console.log("Hello i am from the useEffect of the profile,")
    const query = new URLSearchParams(window.location.search);
    const userData = query.get('user');

    if (userData) {
        try {
            const parsedUser = JSON.parse(decodeURIComponent(userData));
            console.log('Parsed user data:', parsedUser); // Debug
            localStorage.setItem('userId', parsedUser.id); // Save ID for API use
            setProfile((prevProfile) => ({
                ...prevProfile,
                name: parsedUser.name,
                email: parsedUser.email,
            }));
        } catch (error) {
            console.error('Error parsing user data:', error);
            handleError('Failed to parse user data. Please log in again.');
            navigate('/login');
        }
    } else {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            handleError('User ID not found. Please log in again.');
            navigate('/login'); // Redirect to login if no user data is found
        } else {
            fetchProfile();
        }
    }
}, [navigate]);


    const fetchProfile = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            return handleError('User ID not found. Please log in again.');
        }

        try {
            const response = await fetch(`${backendUrl}/profile/getprofile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ _id: userId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                return handleError('Failed to load profile');
            }

            const result = await response.json();
            if (result.success) {
                const { data } = result;
                setProfile({
                    name: data.name,
                    email: data.email,
                    profilePicture: data.avatar || 'https://cdn.weatherapi.com/weather/64x64/day/113.png',
                    weight: data.weight,
                    height: data.height,
                    gender: data.gender,
                    BMI: data.BMI,
                    calories: data.calories,
                });
                handleSuccess(result.message || 'Profile loaded successfully');
            } else {
                handleError(result.message || 'Failed to fetch profile');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            handleError('An unexpected error occurred');
        }
    };
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setProfile((prevProfile) => ({
    //         ...prevProfile,
    //         [name]: value,
    //     }));
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile((prevProfile) => {
            const updatedProfile = {
                ...prevProfile,
                [name]: value,
            };

            // Calculate BMI if weight or height is updated
            if (name === "weight" || name === "height") {
                const weight = parseFloat(updatedProfile.weight);
                const height = parseFloat(updatedProfile.height) / 100; // Convert height to meters
                if (weight && height) {
                    updatedProfile.BMI = (weight / (height * height)).toFixed(2); // Calculate BMI
                } else {
                    updatedProfile.BMI = 0; // Reset BMI if values are incomplete
                }
            }

            // Calculate calories (example: basic calculation based on weight and gender)
            if (updatedProfile.weight && updatedProfile.gender) {
                const weight = parseFloat(updatedProfile.weight);
                const genderFactor = updatedProfile.gender === "male" ? 2500 : 2000; // Example logic
                updatedProfile.calories = Math.round(genderFactor - (weight * 10)); // Example calorie calculation
            } else {
                updatedProfile.calories = 0; // Reset calories if data is incomplete
            }

            return updatedProfile;
        });
    };



    // const handleSave = async () => {
    //     try {
    //         // Get the userId from localStorage
    //         const userId = localStorage.getItem('userId');
    //         console.log(userId)
    //         if (!userId) {
    //             return handleError('User ID not found. Please log in again.');
    //         }
    
    //         // Include the userId in the request body
    //         const updatedProfile = {
    //             ...profile,
    //             userId, // Add the userId from localStorage
    //         };
    
    //         const response = await fetch('http://localhost:8080/profile/updateProfile', {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(updatedProfile), // Send the updated profile with userId
    //         });
    
    //         const result = await response.json();
    
    //         if (result.success) {
    //             handleSuccess(result.message || 'Profile updated successfully');
    //         } else {
    //             handleError(result.message || 'Failed to update profile');
    //         }
    //     } catch (err) {
    //         console.error('Update error:', err);
    //         handleError('An unexpected error occurred');
    //     }
    // };
    const handleSave = async () => {
        const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
        if (!userId) {
            return handleError('User ID not found. Please log in again.');
        }
    
        // Prepare payload
        const profilePayload = {
            _id: userId,
            updates: {
                name: profile.name,
                height: parseFloat(profile.height),
                BMI: parseFloat(profile.BMI),
                gender: profile.gender,
                goals: ["To complete a marathon within the next 12 months by following a structured training plan."], // Example static data
                weight: parseFloat(profile.weight),
                values: "I like to spend time with my family", // Example static data
                mission: "To inspire and mentor others in personal growth by sharing knowledge, providing guidance, and supporting well-being.", // Example static data
                vision: "To be a compassionate, influential leader who empowers others to reach their fullest potential.", // Example static data
                calories: parseInt(profile.calories),
            },
        };
    
        try {
            const response = await fetch(`${backendUrl}/profile/updateProfile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profilePayload),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Something went wrong!");
            }
    
            handleSuccess(data.message || "Profile updated successfully");
        } catch (error) {
            console.error("Error:", error.message);
            handleError("An error occurred while updating the profile");
        }
        setTimeout(() => navigate('/home'), 2000);
    };
    
    
    

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePicture', file);

            try {
                const response = await fetch(`${backendUrl}/profile/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                if (result.success) {
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        profilePicture: result.imageUrl, // URL from server response
                    }));
                    handleSuccess('Profile picture uploaded successfully');
                } else {
                    handleError(result.message || 'Failed to upload profile picture');
                }
            } catch (err) {
                console.error('Image upload error:', err);
                handleError('An unexpected error occurred during image upload');
            }
        }
    };

    return (
        <div className="profile-container">
            <h1 className='color-white'>Profile</h1>
            {/* {profile.profilePicture && (
                <img
                    src={profile.profilePicture}
                    alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
            )} */}

            <div>
                <div className="main-profile">
                
                <label className='color-white'>Profile Picture:</label>
                <input type="file" onChange={handleImageUpload} className='color-white' />
                {profile.profilePicture && (
                    <img
                        src={profile.profilePicture}
                        alt="Profile"
                        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                    />
                )}
            </div>
<div className="profile-form-main">


            <div className='margin-main'>
                <label className='color-white'>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                />
            </div>
            <div className='margin-main'>
                <label className='color-white'>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                />
            </div>

            <div className='margin-main'> 
                <label htmlFor="gender" className='color-white'>Gender:</label>
                <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                >
                    <option value="" >Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>

            <div className='margin-main'>
                <label className='color-white'>Weight:</label>
                <input
                    type="number"
                    name="weight"
                    value={profile.weight}
                    onChange={handleChange}
                />
            </div>
            <div className='margin-main'>
                <label className='color-white'>Height:</label>
                <input
                    type="number"
                    name="height"
                    value={profile.height}
                    onChange={handleChange}
                />
            </div>
            <div className='margin-main'>
                <label className='color-white'>BMI:</label>
                <input
                    type="number"
                    name="BMI"
                    value={profile.BMI}
                    readOnly
                />
            </div>
            <div className='margin-main'>
                <label className='color-white'>Calories:</label>
                <input
                    type="number"
                    name="calories"
                    value={profile.calories}
                    readOnly
                />
            </div>
            </div>
            </div>
            <button onClick={handleSave}>Save</button>
            <ToastContainer />
        </div>
    );
};

export default Profile;

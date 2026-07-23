import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#6b7280"/>
  <circle cx="50" cy="38" r="16" fill="#d1d5db"/>
  <path d="M50 58c-18 0-32 12-32 28v14h64V86c0-16-14-28-32-28z" fill="#d1d5db"/>
</svg>
`);

// Helper: crop the image on a canvas and return a File
const getCroppedImageFile = (imageSrc, croppedAreaPixels) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg');
        };
        image.onerror = reject;
    });
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [country, setCountry] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [saving, setSaving] = useState(false);

    // Crop modal state
    const [showCropModal, setShowCropModal] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [todayGoal, setTodayGoal] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchTodayGoal();
    }, []);

    const fetchTodayGoal = async () => {
        try {
            const { data } = await API.get('/goals');
            setTodayGoal(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/profile');
            setProfile(data);
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setPhone(data.phone || '');
            setDob(data.dob ? data.dob.slice(0, 10) : '');
            setCountry(data.country || '');
        } catch (error) {
            toast.error('Failed to load profile');
        }
        setLoading(false);
    };

    // Step 1: user picks a raw file -> open crop modal
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setRawImageSrc(reader.result);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const onCropComplete = useCallback((_, croppedAreaPixelsValue) => {
        setCroppedAreaPixels(croppedAreaPixelsValue);
    }, []);

    // Step 2: user confirms crop -> generate final File + preview
    const handleConfirmCrop = async () => {
        try {
            const croppedFile = await getCroppedImageFile(rawImageSrc, croppedAreaPixels);
            setPhotoFile(croppedFile);
            setPhotoPreview(URL.createObjectURL(croppedFile));
            setImgError(false);
            setShowCropModal(false);
            setRawImageSrc(null);
        } catch (error) {
            toast.error('Failed to crop image');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            toast.error('Please enter a valid 10-digit Indian phone number');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('phone', phone);
            formData.append('dob', dob);
            formData.append('country', country);
            if (photoFile) formData.append('photo', photoFile);

            const { data } = await API.put('/profile', formData);

            setProfile((prev) => ({ ...prev, ...data }));
            setPhotoFile(null);
            setPhotoPreview(null);
            setImgError(false);
            toast.success('Profile updated!');
        } catch (error) {
            const errMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Failed to update profile';
            toast.error(errMsg);
        }
        setSaving(false);
    };

    const handleDeletePhoto = async () => {
        try {
            await API.delete('/profile/photo');
            setProfile((prev) => ({ ...prev, photo: null }));
            setImgError(false);
            toast.success('Photo removed!');
        } catch (error) {
            toast.error('Failed to remove photo');
        }
    };

    const handleResetPassword = async () => {
        try {
            const { data } = await API.post('/auth/forgot-password', { email: profile.email });
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        }
    };

    const hasCustomPhoto = Boolean(profile && profile.photo && profile.photo.trim() !== '');
    const displaySrc = photoPreview || (hasCustomPhoto && !imgError ? profile.photo : DEFAULT_AVATAR);

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="relative w-24 h-24">
                            <img
                                src={displaySrc}
                                alt="Profile"
                                onError={() => setImgError(true)}
                                className="w-24 h-24 rounded-full object-cover bg-gray-700"
                            />
                            {hasCustomPhoto && (
                                <button
                                    onClick={handleDeletePhoto}
                                    title="Remove photo"
                                    className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer inline-block h-fit">
                            Change Photo
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                                    placeholder="First name"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="w-full bg-gray-700 text-gray-500 p-3 rounded-lg cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="10-digit mobile number"
                                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    max={new Date().toISOString().slice(0, 10)}
                                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1">Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g. India"
                                className="w-full bg-gray-700 text-white p-3 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1">Password</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="password"
                                    value="••••••••"
                                    disabled
                                    className="flex-1 bg-gray-700 text-gray-300 p-3 rounded-lg cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm whitespace-nowrap"
                                >
                                    {profile?.hasPassword ? 'Reset' : 'Set Password'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>

                    {todayGoal && todayGoal.target > 0 && (
                        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-gray-300 text-sm font-medium">Today's Goal</p>
                                <span className={`text-sm font-bold ${todayGoal.achieved >= todayGoal.target ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {todayGoal.achieved} / {todayGoal.target} solved
                                </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full ${todayGoal.achieved >= todayGoal.target ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, Math.round((todayGoal.achieved / todayGoal.target) * 100))}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-400 text-sm mb-3">
                            Joined on {new Date(profile?.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-700 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs">Total Problems</p>
                                <p className="text-white text-xl font-bold">{profile?.totalProblems || 0}</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs">Total Topics</p>
                                <p className="text-white text-xl font-bold">{profile?.totalTopics || 0}</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs">Completed Topics</p>
                                <p className="text-green-400 text-xl font-bold">{profile?.completedTopics || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-white font-bold text-lg mb-3">Adjust Your Photo</h3>

                        <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden">
                            <Cropper
                                image={rawImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-gray-400 text-sm block mb-1">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleConfirmCrop}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                            >
                                Save Crop
                            </button>
                            <button
                                onClick={() => { setShowCropModal(false); setRawImageSrc(null); }}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { useAuth } from '../context/AuthContext';
import {
    User, ShieldCheck, Info, Camera, Trash2, Calendar,
    BookOpen, Layers, CheckCircle2, Target, RotateCcw,
    Mail, AtSign, BadgeCheck, Trophy
} from 'lucide-react';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#6b7280"/>
  <circle cx="50" cy="38" r="16" fill="#d1d5db"/>
  <path d="M50 58c-18 0-32 12-32 28v14h64V86c0-16-14-28-32-28z" fill="#d1d5db"/>
</svg>
`);

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
    const { updateUser } = useAuth();
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

    const [showCropModal, setShowCropModal] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [todayGoal, setTodayGoal] = useState(null);
    const [revisionCount, setRevisionCount] = useState(0);

    useEffect(() => {
        fetchProfile();
        fetchTodayGoal();
        fetchRevisionCount();
    }, []);

    const fetchTodayGoal = async () => {
        try {
            const { data } = await API.get('/goals');
            setTodayGoal(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Reuses the same /topics endpoint the Topics page uses, just to count needsRevision
    const fetchRevisionCount = async () => {
        try {
            const { data } = await API.get('/topics');
            setRevisionCount((data || []).filter(t => t.needsRevision).length);
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
            updateUser({ firstName: data.firstName, lastName: data.lastName, photo: data.photo });
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
            updateUser({ photo: null });
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

    const cardClass = "bg-surface-card border border-surface-border rounded-2xl shadow-md hover:shadow-lg hover:border-[#AECDEA] hover:-translate-y-1 transition-all duration-300";
    const inputClass = "w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

    const goalPct = todayGoal && todayGoal.target > 0
        ? Math.min(100, Math.round((todayGoal.achieved / todayGoal.target) * 100))
        : 0;

    const totalTopicsCount = profile?.totalTopics || 0;
    const completedTopicsCount = profile?.completedTopics || 0;
    const completionPct = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text">My Profile</h1>
                <p className="text-text-muted mt-1">Manage your personal information, account, and security settings.</p>
            </div>

            {/* Profile Header */}
            <div className={`${cardClass} p-4 mb-5 flex items-center justify-between gap-4 flex-wrap`}>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 shrink-0">
                        <img
                            src={displaySrc}
                            alt="Profile"
                            onError={() => setImgError(true)}
                            className="w-16 h-16 rounded-full object-cover bg-surface-bg border-2 border-surface-border"
                        />
                        {hasCustomPhoto && (
                            <button
                                onClick={handleDeletePhoto}
                                title="Remove photo"
                                className="absolute bottom-0 right-0 bg-danger hover:bg-danger/90 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-surface-card"
                            >
                                <Trash2 size={11} />
                            </button>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-text font-bold text-lg truncate">
                            {profile?.firstName} {profile?.lastName}
                        </h2>
                        <p className="text-text-muted text-sm truncate">{profile?.email}</p>
                        <p className="text-text-muted text-xs mt-0.5">
                            Member since {new Date(profile?.joinedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <label className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer inline-flex items-center gap-2 shrink-0">
                    <Camera size={15} />
                    Change Photo
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
            </div>

            {/* Personal Information */}
            <div className={`${cardClass} p-5 mb-5`}>
                <h2 className="text-text font-bold mb-5 flex items-center gap-2">
                    <User size={18} className="text-brand" />
                    Personal Information
                </h2>

                <form onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-text-muted text-sm mb-2">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClass}
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-2">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClass}
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-text-muted text-sm mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="10-digit mobile number"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-2">Date of Birth</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-text-muted text-sm mb-2">Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="e.g. India"
                            className={inputClass}
                        />
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-brand hover:bg-brand-hover disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Information + Quick Stats — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 items-stretch">
                {/* Account Information */}
                <div className={`${cardClass} p-5 flex flex-col`}>
                    <h2 className="text-text font-bold mb-5 flex items-center gap-2">
                        <Info size={18} className="text-brand" />
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-text-muted text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                <Mail size={12} /> Email
                            </label>
                            <p className="text-text text-sm">{profile?.email}</p>
                        </div>
                        <div>
                            <label className="text-text-muted text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                <AtSign size={12} /> Username
                            </label>
                            <p className="text-text text-sm">{profile?.email?.split('@')[0]}</p>
                        </div>
                        <div>
                            <label className="text-text-muted text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                <BadgeCheck size={12} /> Account Status
                            </label>
                            <span className="inline-flex items-center gap-1 text-success text-sm font-semibold bg-success/10 px-2.5 py-1 rounded-full">
                                <CheckCircle2 size={13} /> Verified
                            </span>
                        </div>
                        <div>
                            <label className="text-text-muted text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                <Calendar size={12} /> Joined On
                            </label>
                            <p className="text-text text-sm">
                                {new Date(profile?.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className={`${cardClass} p-5`}>
                    <h2 className="text-text font-bold mb-5 flex items-center gap-2">
                        <Layers size={18} className="text-brand" />
                        Quick Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`${cardClass} p-4 flex flex-col items-center text-center gap-1`}>
                            <BookOpen size={18} className="text-brand mb-1" />
                            <span className="text-brand text-2xl font-bold">{profile?.totalProblems || 0}</span>
                            <span className="text-text-muted text-xs">Problems Solved</span>
                        </div>
                        <div className={`${cardClass} p-4 flex flex-col items-center text-center gap-1`}>
                            <Layers size={18} className="text-text-muted mb-1" />
                            <span className="text-text text-2xl font-bold">{profile?.totalTopics || 0}</span>
                            <span className="text-text-muted text-xs">Topics Added</span>
                            <span className="text-text-muted text-[11px]">{profile?.completedTopics || 0} Completed</span>
                        </div>
                        <div className={`${cardClass} p-4 flex flex-col items-center text-center gap-1`}>
                            <CheckCircle2 size={18} className="text-success mb-1" />
                            <span className="text-success text-2xl font-bold">{profile?.completedTopics || 0}</span>
                            <span className="text-text-muted text-xs">Completed Topics</span>
                            <span className="text-success text-[11px] font-semibold">{completionPct}%</span>
                        </div>
                        <div className={`${cardClass} p-4 flex flex-col items-center text-center gap-1`}>
                            <RotateCcw size={18} className="text-danger mb-1" />
                            <span className="text-danger text-2xl font-bold">{revisionCount}</span>
                            <span className="text-text-muted text-xs">Revision Pending</span>
                            <span className="text-text-muted text-[11px]">
                                {revisionCount === 0 ? 'All caught up 🎉' : 'Needs attention'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Goal Progress */}
            {todayGoal && todayGoal.target > 0 && (
                <div className={`${cardClass} p-5 mb-5`}>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-text font-bold flex items-center gap-2">
                            <Target size={18} className="text-brand" /> Today's Goal Progress
                        </p>
                        <span className={`text-sm font-bold ${todayGoal.achieved >= todayGoal.target ? 'text-success' : 'text-brand'}`}>
                            {todayGoal.achieved} / {todayGoal.target} solved
                        </span>
                    </div>
                    <div className="w-full bg-surface-bg rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${todayGoal.achieved >= todayGoal.target ? 'bg-success' : 'bg-brand'}`}
                            style={{ width: `${goalPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Security */}
            <div className={`${cardClass} p-5`}>
                <h2 className="text-text font-bold mb-5 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-brand" />
                    Security
                </h2>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <label className="block text-text-muted text-sm mb-2">Password</label>
                        <p
                            className="text-text text-lg tracking-widest inline-block px-3 py-1.5 rounded-lg mb-2"
                            style={{ backgroundColor: '#FAFBFC' }}
                        >
                            ••••••••••••
                        </p>
                        <p className="text-text-muted text-xs">
                            Last Updated: {new Date(profile?.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        className="bg-surface-bg hover:bg-surface-border text-text px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap border border-surface-border transition"
                    >
                        {profile?.hasPassword ? 'Change Password' : 'Set Password'}
                    </button>
                </div>
            </div>

            {/* Achievements */}
            <div className={`${cardClass} p-5 mt-5`}>
                <h2 className="text-text font-bold mb-5 flex items-center gap-2">
                    <Trophy size={18} className="text-brand" />
                    Achievements
                </h2>
                <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-lg bg-surface-bg ${(profile?.totalProblems || 0) < 1 ? 'opacity-40' : ''}`}>
                        <span className="text-xl">🏆</span>
                        <div>
                            <p className="text-text text-sm font-semibold">First Problem Solved</p>
                            {(profile?.totalProblems || 0) < 1 && <p className="text-text-muted text-xs">Locked</p>}
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg bg-surface-bg ${(profile?.totalProblems || 0) < 10 ? 'opacity-40' : ''}`}>
                        <span className="text-xl">🏅</span>
                        <div>
                            <p className="text-text text-sm font-semibold">10 Problems Milestone</p>
                            <p className="text-text-muted text-xs">
                                {(profile?.totalProblems || 0) < 10 ? `Locked (${profile?.totalProblems || 0}/10)` : 'Unlocked'}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg bg-surface-bg ${(profile?.completedTopics || 0) < 1 ? 'opacity-40' : ''}`}>
                        <span className="text-xl">⭐</span>
                        <div>
                            <p className="text-text text-sm font-semibold">First Topic Completed</p>
                            {(profile?.completedTopics || 0) < 1 && <p className="text-text-muted text-xs">Locked</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-text font-bold text-lg mb-3">Adjust Your Photo</h3>

                        <div className="relative w-full h-80 bg-surface-bg rounded-lg overflow-hidden">
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
                            <label className="text-text-muted text-sm block mb-1">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-brand"
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleConfirmCrop}
                                className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-lg font-semibold transition"
                            >
                                Save Crop
                            </button>
                            <button
                                onClick={() => { setShowCropModal(false); setRawImageSrc(null); }}
                                className="flex-1 bg-surface-bg hover:bg-surface-border text-text py-3 rounded-lg font-semibold border border-surface-border transition"
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
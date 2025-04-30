import React, { useState } from 'react';

function TwitterEngagement() {
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!username) {
      setError("Please enter a username.");
      return;
    }

    setLoading(true);
    setError(null);
    setProfileData(null);

    try {
      const response = await fetch('http://localhost:5000/get_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data.');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setProfileData(data);
        console.log('Profile Data:', data);
      }
    } catch (error) {
      setError('Error fetching profile data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-blue-700 mb-10 text-center">Twitter Profile Engagement</h1>

      <div className="mb-10">
        <div className="flex space-x-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Twitter Username"
            className="flex-grow px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md transition duration-200 text-lg"
          />
          <button
            onClick={fetchProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md transition duration-200 text-lg"
          >
            Fetch Profile
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center my-8">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && <div className="text-center text-red-600 font-semibold text-lg">{error}</div>}

      {profileData && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden animate-fadeIn p-8 space-y-6">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <img
              src={profileData.profile_photo || '/placeholder.svg'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-blue-600"
            />
          </div>

          {/* Profile Name */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">{username}</h2>
          </div>

          {/* Bio Section */}
          <div className="text-center bg-gray-50 p-4 rounded-lg shadow">
            <p className="text-lg text-gray-700"><strong>Bio:</strong> {profileData.bio || 'No bio available'}</p>
          </div>

          {/* Joined Date Section */}
          <div className="text-center bg-gray-200 p-4 rounded-lg shadow">
            <p className="text-lg text-gray-800 font-semibold">Joined:</p>
            <p className="text-gray-900">{profileData.joined_date}</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <div className="text-center">
              <p className="text-gray-600 text-lg">Posts</p>
              <p className="text-3xl font-bold text-blue-600">{profileData.posts}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-lg">Following</p>
              <p className="text-3xl font-bold text-blue-600">{profileData.following}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-lg">Followers</p>
              <p className="text-3xl font-bold text-blue-600">{profileData.followers}</p>
            </div>
          </div>

          {/* Recent Tweets */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Tweets</h3>
            <ul className="space-y-6">
              {profileData.tweets.map((tweet, index) => (
                <li key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-200">
                  <p className="text-gray-800 text-lg mb-2">{tweet.text}</p>
                  <p className="text-md font-semibold text-blue-600">Sentiment Score: {tweet.sentiment}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default TwitterEngagement;

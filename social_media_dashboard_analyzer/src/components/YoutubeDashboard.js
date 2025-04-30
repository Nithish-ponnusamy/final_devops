import React, { useState } from 'react';
import Plot from 'react-plotly.js';

function YoutubeDashboard() {
  const [channelName, setChannelName] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannelData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setChannelData(null);

    try {
      const response = await fetch(`http://localhost:5000/api/channel/${channelName}`);
      
      if (!response.ok) {
        throw new Error('Channel not found or error in fetching data.');
      }
      
      const data = await response.json();
      setChannelData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (!channelData || !channelData.recentVideos) return null;

    const videoTitles = channelData.recentVideos.map(video => video.title);
    const likes = channelData.recentVideos.map(video => video.likes);
    const comments = channelData.recentVideos.map(video => video.comments);

    return (
      <div className="space-y-8">
        <Plot
          data={[{
            x: videoTitles,
            y: likes,
            type: 'bar',
            name: 'Likes',
            marker: { color: '#0d94d2' }
          }]}
          layout={{
            title: 'Recent Videos Likes',
            xaxis: { title: 'Video Titles' },
            yaxis: { title: 'Number of Likes' },
            autosize: true
          }}
          useResizeHandler={true}
          style={{width: "100%", height: "100%"}}
        />

        <Plot
          data={[{
            x: videoTitles,
            y: comments,
            type: 'bar',
            name: 'Comments',
            marker: { color: '#f39c12' }
          }]}
          layout={{
            title: 'Recent Videos Comments',
            xaxis: { title: 'Video Titles' },
            yaxis: { title: 'Number of Comments' },
            autosize: true
          }}
          useResizeHandler={true}
          style={{width: "100%", height: "100%"}}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Plot
            data={[{
              labels: videoTitles.slice(0, 5).map((_, index) => `Video ${index + 1}`),
              values: likes.slice(0, 5),
              type: 'pie',
              textinfo: 'label+percent',
              marker: { colors: ['#0d94d2', '#3498db', '#5dade2', '#85c1e9', '#a9cce3'] },
              hole: 0.4
            }]}
            layout={{
              title: 'Likes Distribution of Top 5 Videos',
              autosize: true
            }}
            useResizeHandler={true}
            style={{width: "100%", height: "100%"}}
          />

          <Plot
            data={[{
              labels: videoTitles.slice(0, 5).map((_, index) => `Video ${index + 1}`),
              values: comments.slice(0, 5),
              type: 'pie',
              textinfo: 'label+percent',
              marker: { colors: ['#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b'] },
              hole: 0.4
            }]}
            layout={{
              title: 'Comments Distribution of Top 5 Videos',
              autosize: true
            }}
            useResizeHandler={true}
            style={{width: "100%", height: "100%"}}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-8 text-center">YouTube Dashboard</h1>
      
      <form onSubmit={fetchChannelData} className="mb-10 flex justify-center">
        <div className="flex space-x-2 items-center w-full max-w-lg">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter Channel Name"
            className="flex-grow px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition duration-200"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          >
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col justify-center items-center space-y-4 mt-8 animate-fadeIn">
          <div className="w-16 h-16 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
          <span className="text-xl font-semibold text-blue-600">Fetching channel data...</span>
        </div>
      )}

      {error && <div className="text-center text-red-600 font-semibold mt-8">{error}</div>}

      {channelData && (
        <div className="space-y-10 animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center transition transform hover:scale-105">
            <img src={channelData.stats.channelThumbnail} alt="Channel thumbnail" className="w-32 h-32 rounded-full mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-blue-600">{channelData.stats.channelName}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-200">
              <h3 className="text-lg font-semibold mb-2">Subscribers</h3>
              <p className="text-3xl font-bold text-blue-600">{channelData.stats.totalSubscribers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-200">
              <h3 className="text-lg font-semibold mb-2">Total Views</h3>
              <p className="text-3xl font-bold text-blue-600">{channelData.stats.totalViews}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-200">
              <h3 className="text-lg font-semibold mb-2">Total Videos</h3>
              <p className="text-3xl font-bold text-blue-600">{channelData.stats.totalVideos}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-6">Recent Videos</h3>
            <div className="space-y-6">
              {channelData.recentVideos.map((video, index) => (
                <div key={index} className="border-b pb-6 space-y-3 text-gray-800">
                  <h4 className="font-semibold text-lg">{video.title}</h4>
                  <p className="text-sm text-gray-600">Published on: {new Date(video.publishedAt).toLocaleDateString()}</p>
                  <div className="flex flex-col space-y-1 text-gray-700 font-medium">
                    <p className="text-lg">Views: <span className="font-bold text-gray-900">{video.views}</span></p>
                    <p className="text-lg">Likes: <span className="font-bold text-gray-900">{video.likes}</span></p>
                    <p className="text-lg">Comments: <span className="font-bold text-gray-900">{video.comments}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {renderCharts()}
        </div>
      )}
    </div>
  );
}

export default YoutubeDashboard;

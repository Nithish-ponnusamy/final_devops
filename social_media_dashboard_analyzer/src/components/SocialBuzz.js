import React, { useState, useEffect } from 'react';

function SocialBuzz() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const apiKey = '8b6c001fd05c4f099e617d5dffb8deae'; // Replace with your actual API key
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      const formattedDate = lastWeek.toISOString().split('T')[0];

      const response = await fetch(`https://newsapi.org/v2/everything?q=social+media&from=${formattedDate}&apiKey=${apiKey}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setArticles(data.articles);
      setLoading(false);
    } catch (error) {
      setError('Failed to load news articles. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex justify-center items-center text-2xl text-blue-600 mt-8"
      >
        <div className="animate-spin border-4 border-t-4 border-blue-600 rounded-full w-16 h-16 mr-4"></div>
        Loading news articles...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-2xl text-red-600 mt-8">{error}</div>;
  }

  return (
    <div className="space-y-12 px-6 md:px-12 lg:px-16">
      <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">Latest News about Social Media</h1>

      {articles.length === 0 ? (
        <div className="text-center text-2xl text-gray-600">No articles found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                {article.title && (
                  <h2 className="text-xl font-semibold text-blue-600 mb-3 truncate">{article.title}</h2>
                )}
                {article.description && (
                  <p className="text-gray-700 mb-4 text-sm">{article.description}</p>
                )}
                {article.source?.name && (
                  <p className="text-sm text-gray-500 text-right">Source: {article.source.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialBuzz;

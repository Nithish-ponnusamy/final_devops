import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

function Dashboard({ initialTip = 0, showInitialQuiz = false }) {
  const [typedText, setTypedText] = useState('');
  const [currentTip, setCurrentTip] = useState(initialTip);
  const [showQuiz, setShowQuiz] = useState(showInitialQuiz);
  const [answers, setAnswers] = useState(Array(5).fill(''));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sentiment, setSentiment] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const aboutText = "Our Social Media Dashboard Analyzer helps you track and understand the impact of your posts across various platforms. Get real-time insights into engagement, analyze audience sentiment, and visualize data through detailed charts. Whether you're a marketer, business owner, or influencer, our tool empowers you to make data-driven decisions and enhance your social media strategy.";

  const tips = useMemo(() => [
    "Be consistent with your posting schedule to keep your audience engaged.",
    "Use analytics to understand what content resonates most with your audience.",
    "Engage with your followers by responding to comments and direct messages.",
    "Use hashtags strategically to expand the reach of your posts."
  ], []);

  const featureImages = [
    "/image/Realtime-Analytics.png", 
    "/image/istockphoto-1435905195-612x612.jpg",
    "/image/image3-2.webp"
  ];

  const questions = useMemo(() => [
    "How do you feel about the current situation?",
    "Do you think the current experience is meeting your expectations?",
    "What is your overall satisfaction with your recent experience?",
    "How would you describe the atmosphere or environment?",
    "How do you feel about your current performance or progress?"
  ], []);

  const optionsMap = useMemo(() => ({
    0: ['Good', 'Neutral', 'Bad'],
    1: ['Yes', 'No'],
    2: ['Very Satisfied', 'Neutral', 'Dissatisfied'],
    3: ['Calm', 'Excited', 'Bored'],
    4: ['Satisfied', 'Neutral', 'Unsatisfied']
  }), []);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
    setSelectedOption(value);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setSelectedOption(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      analyzeSentimentWithML();
    }
  };

  const analyzeSentimentWithML = async () => {
    setIsLoading(true);
    try {
      const sentimentScores = answers.map(answer => {
        if (answer === 'Good' || answer === 'Yes' || answer === 'Very Satisfied' || 
            answer === 'Excited' || answer === 'Satisfied') return 'positive';
        if (answer === 'Bad' || answer === 'No' || answer === 'Dissatisfied' || 
            answer === 'Bored' || answer === 'Unsatisfied') return 'negative';
        return 'neutral';
      });

      const positiveCount = sentimentScores.filter(score => score === 'positive').length;
      const negativeCount = sentimentScores.filter(score => score === 'negative').length;
      const neutralCount = sentimentScores.filter(score => score === 'neutral').length;

      if (positiveCount > negativeCount && positiveCount > neutralCount) {
        setSentiment('Positive');
      } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
        setSentiment('Negative');
      } else {
        setSentiment('Neutral');
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/image/fallback-image.png';
  };

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < aboutText.length) {
        setTypedText(prev => prev + aboutText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);

    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 4000);

    return () => {
      clearInterval(typingInterval);
      clearInterval(tipInterval);
    };
  }, [aboutText.length, tips.length]);

  return (
    <ErrorBoundary>
      <div className="space-y-12 p-8 max-w-7xl mx-auto">
        <section className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <h2 className="text-3xl font-bold text-blue-600 mb-4 animate-fadeIn">About Our Dashboard</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{typedText}</p>
        </section>

        <section className="bg-gray-50 p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <h2 className="text-3xl font-bold text-blue-600 mb-4 animate-fadeIn">Social Media Tips</h2>
          <div className="text-lg text-gray-700 leading-relaxed h-24 flex items-center justify-center">
            <div className="carousel relative w-full">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`absolute transition-opacity duration-500 ${index === currentTip ? 'opacity-100' : 'opacity-0'}`}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <h2 className="text-3xl font-bold text-blue-600 mb-4 animate-fadeIn">Sentiment Analysis Quiz</h2>
          {!showQuiz ? (
            <button
              onClick={() => setShowQuiz(true)}
              className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Take Quiz
            </button>
          ) : (
            <div className="space-y-4">
              <div className="carousel relative w-full transition-opacity duration-500">
                <h3 className={`text-2xl font-semibold mb-4 ${currentQuestionIndex === 0 ? 'text-blue-600' : ''}`}>
                  {questions[currentQuestionIndex]}
                </h3>
                <div className="space-y-4">
                  {optionsMap[currentQuestionIndex].map((option, index) => (
                    <button
                      key={index}
                      className={`w-full p-2 rounded-lg transition-all duration-200 ${
                        selectedOption === option ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      onClick={() => handleAnswerChange(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={nextQuestion}
                  disabled={isLoading}
                  className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isLoading ? 'Processing...' : 
                    currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
              {sentiment && (
                <p className="text-lg font-semibold text-center mt-4">
                  Overall Sentiment: <span className="text-blue-600">{sentiment}</span>
                </p>
              )}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Real-time Analytics", "User Sentiment", "Engagement Graphs"].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <img 
                src={featureImages[index]} 
                alt={feature}
                onError={handleImageError}
                className="w-full h-40 object-cover rounded-lg mb-4" 
              />
              <h3 className="text-2xl font-semibold text-blue-600 mb-3">{feature}</h3>
              <p className="text-gray-700">
                {index === 0 ? 'Get insights into your social media performance with real-time data.' : 
                  index === 1 ? 'Analyze how users feel about your posts and content.' : 
                  'Generate detailed graphs on likes, comments, and shares.'}
              </p>
            </div>
          ))}
        </section>
      </div>
    </ErrorBoundary>
  );
}

Dashboard.propTypes = {
  initialTip: PropTypes.number,
  showInitialQuiz: PropTypes.bool
};

export default Dashboard;
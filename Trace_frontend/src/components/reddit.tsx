import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RedditDrugPostsAnalysis = () => {
  const postsData = [
    {
      userName: "Icy-Book2999",
      postText: "Selling weed to the police",
      potentialTrafficking: "true",
      confidenceLevel: "low",
      drugTerms: ["weed", "cannabis"]
    },
    {
      userName: "Theo04t",
      postText: "GenZ has idolised weed",
      potentialTrafficking: "false",
      confidenceLevel: "low",
      drugTerms: ["weed", "cannabis"]
    },
    {
      userName: "putoelquelolea420",
      postText: "DON'T 👏SMOKE 👏 WEED 👏",
      potentialTrafficking: "false",
      confidenceLevel: "low",
      drugTerms: ["weed", "cannabis"]
    },
    {
      userName: "themedicinemayne",
      postText: "Is this weed? Found it in my yard, looks like weed",
      potentialTrafficking: "false",
      confidenceLevel: "low",
      drugTerms: ["weed", "cannabis"]
    },
    {
      userName: "OneBeautifulSOB",
      postText: "Sold weed to Mac twice, here's the story",
      potentialTrafficking: "true",
      confidenceLevel: "low",
      drugTerms: ["weed", "cannabis"]
    },
    {
      userName: "Mysterious_Kim3298",
      postText: "They're all smoking weed instead.",
      potentialTrafficking: "false",
      confidenceLevel: "low",
      drugTerms: ["weed", "cannabis"]
    },
    {
      userName: "spiritoffff",
      postText: "Female California teacher, 43, 'plied boy, 13, with weed then raped him in her car'",
      potentialTrafficking: "false",
      confidenceLevel: "low",
      drugTerms: ["weed"]
    }
  ];

  // Potential Trafficking Data
  const trafficRates = [
    { name: 'Potential Trafficking', value: postsData.filter(post => post.potentialTrafficking === "true").length },
    { name: 'No Trafficking', value: postsData.filter(post => post.potentialTrafficking === "false").length }
  ];

  // Drug Terms Analysis
  const drugTermsData = [
    {
      name: 'Weed',
      value: postsData.filter(post => post.drugTerms.includes('weed')).length,
      percentage: ((postsData.filter(post => post.drugTerms.includes('weed')).length / postsData.length) * 100).toFixed(2)
    },
    {
      name: 'Cannabis',
      value: postsData.filter(post => post.drugTerms.includes('cannabis')).length,
      percentage: ((postsData.filter(post => post.drugTerms.includes('cannabis')).length / postsData.length) * 100).toFixed(2)
    }
  ];

  // Post Sentiment Analysis
  const sentimentData = [
    {
      name: 'Neutral',
      value: postsData.filter(post =>
        !post.postText.includes('👏') &&
        !post.postText.toLowerCase().includes('sold') &&
        !post.postText.toLowerCase().includes('plied')
      ).length
    },
    {
      name: 'Cautionary',
      value: postsData.filter(post => post.postText.includes('👏')).length
    },
    {
      name: 'Potentially Harmful',
      value: postsData.filter(post =>
        post.postText.toLowerCase().includes('sold') ||
        post.postText.toLowerCase().includes('plied')
      ).length
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Reddit Drug-Related Posts Analysis</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Potential Drug Trafficking Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Potential Drug Trafficking</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficRates}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drug Terms Usage Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Drug Terms Usage</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={drugTermsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {drugTermsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const percentage = props.payload.percentage;
                    return [`${value} (${percentage}%)`, name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Post Sentiment Analysis Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Post Sentiment Analysis</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Drug Terms Analysis Card */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Detailed Drug Terms Analysis</h2>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={drugTermsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Number of Posts', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value, name, props) => {
                  const percentage = props.payload.percentage;
                  return [`${value} (${percentage}%)`, name];
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200">Key Insights</h2>
        <ul className="space-y-2 pl-4">
          <li className="flex justify-between border-b pb-1 border-gray-100">
            <span className="font-medium">Total Posts Analyzed:</span>
            <span>{postsData.length}</span>
          </li>
          <li className="flex justify-between border-b pb-1 border-gray-100">
            <span className="font-medium">Posts with "Weed" Term:</span>
            <span>{drugTermsData[0].value} ({drugTermsData[0].percentage}%)</span>
          </li>
          <li className="flex justify-between border-b pb-1 border-gray-100">
            <span className="font-medium">Posts with "Cannabis" Term:</span>
            <span>{drugTermsData[1].value} ({drugTermsData[1].percentage}%)</span>
          </li>
          <li className="flex justify-between border-b pb-1 border-gray-100">
            <span className="font-medium">Potential Trafficking Posts:</span>
            <span>{trafficRates[0].value} ({((trafficRates[0].value / postsData.length) * 100).toFixed(2)}%)</span>
          </li>
          <li className="flex justify-between">
            <span className="font-medium">Cautionary or Potentially Harmful Posts:</span>
            <span>{sentimentData[1].value + sentimentData[2].value}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RedditDrugPostsAnalysis;

import React from "react";

export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:transform hover:-translate-y-1">
    <div className="text-green-400 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

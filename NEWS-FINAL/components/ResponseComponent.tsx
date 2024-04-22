// components/ResponseComponent.tsx
"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from './Loading'; // Make sure to provide the correct path to the Loading component

interface NewsItem {
  title: string;
  content: string;
  image: string;
}

const ResponseComponent = () => {
  const [response, setResponse] = useState<NewsItem[] | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('http://127.0.0.1:5000/get_responses');
        console.log('API Response:', result.data);

        // Parse the API response and extract title, content, and fetch image from Unsplash
        const parsedResponse: NewsItem[] = await Promise.all(
          result.data.map(async (item: string, index: number) => {
            const doc = new DOMParser().parseFromString(item, 'text/html');
            const title = doc.querySelector('h2')?.textContent || '';
            const content = doc.querySelector('p')?.textContent || '';
            const image = await fetchImageFromUnsplash(title);
            return { title, content, image };
          })
        );

        setResponse(parsedResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchImageFromUnsplash = async (title: string): Promise<string> => {
    const unsplashAccessKey = 'API_KEY'; // Replace with your Unsplash Access Key
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(title)}&client_id=${unsplashAccessKey}`;

    try {
      const response = await axios.get(unsplashUrl);
      const imageUrl = response.data.urls.small;
      return imageUrl;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return ''; // Return an empty string if an error occurs
    }
  };

  const handleCardClick = (index: number) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="font-poppins" style={{ backgroundColor: '#000000', color: 'white' }}>
      <div className='mt-10 ml-5 flex flex-row'>
        <img src='/assets/logo_Quick.png' className='flex felx-row w-10 h-10'></img>
        <h2 className="text-3xl font-bold mb-6 flex flex-row">Quick Bites</h2>
      </div>
      {response === null ? (
        <Loading />
      ) : (
        <div className="flex flex-wrap">
          {response.map((item, index) => (
            <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 p-4">
              <div
                className={`overflow-hidden shadow-md cursor-pointer rounded-md ${
                  expandedIndex === index ? 'h-auto' : 'h-72'
                } border-gradient transition duration-300 ease-in-out`}
                onClick={() => handleCardClick(index)}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="mb-1 w-full h-32 object-cover rounded-t-xl"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p>{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponseComponent;

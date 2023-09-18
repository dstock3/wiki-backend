const mongoose = require('mongoose');
require('dotenv').config();

const Article = require('../model/article');  // Ensure this path is correct
const User = require('../model/user');  // Ensure this path is correct

mongoose.connect('mongodb://localhost:27017/wiki_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connection established'))
  .catch(error => console.error('DB connection error:', error));

const getRandomUser = async () => {
  const count = await User.countDocuments();
  return User.findOne().skip(Math.floor(Math.random() * count));
};

const createSampleArticles = async () => {
  const user = await getRandomUser();

  return [
    {
      title: 'The Future of Technology',
      content: [
        {
          title: 'Introduction',
          text: 'A deep dive into the upcoming tech trends.',
          info: {
            title: 'Tech Trends 2023',
            image: {
              src: 'path/to/image1.jpg',
              alt: 'Tech Trends Image'
            },
            info: [
              { label: 'Topic', value: 'AI & ML', header: true },
              { label: 'Forecast', value: 'Positive' }
            ]
          }
        },
        {
          title: 'AI & ML',
          text: 'The potential of AI and Machine Learning in the future.',
        }
      ],
      references: [
        {
          name: 'TechCrunch',
          link: 'https://techcrunch.com'
        },
        {
          name: 'Wired',
          link: 'https://wired.com'
        }
      ],
      author: user._id,
      status: 'published'
    },
    {
        title: 'The Rise of Quantum Computing',
        content: [
          {
            title: 'Introduction',
            text: 'Quantum computing, a revolutionary technology, promises to change the world.',
            info: {
              title: 'Quantum Age',
              image: {
                src: 'path/to/quantum_intro.jpg',
                alt: 'Quantum Computer'
              },
              info: [
                { label: 'Topic', value: 'Quantum Mechanics', header: true },
                { label: 'Importance', value: 'High' }
              ]
            }
          },
          {
            title: 'Mechanics behind Quantum Computing',
            text: 'A deep dive into the science of quantum mechanics.',
          }
        ],
        references: [
          {
            name: 'Nature',
            link: 'https://nature.com'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'Sustainability in Modern Architecture',
        content: [
          {
            title: 'Eco-friendly designs',
            text: 'The importance of sustainable designs in modern buildings.',
            info: {
              title: 'Green Buildings',
              image: {
                src: 'path/to/green_building.jpg',
                alt: 'Eco-friendly Building'
              },
              info: [
                { label: 'Topic', value: 'Architecture', header: true },
                { label: 'Trend', value: 'Rising' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'ArchDaily',
            link: 'https://archdaily.com'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'Exploring the Depths: Oceans and Marine Life',
        content: [
          {
            title: 'Marine Biodiversity',
            text: 'The wonders of marine life and their importance in the ecosystem.',
            info: {
              title: 'Ocean Exploration',
              image: {
                src: 'path/to/marine_life.jpg',
                alt: 'Coral Reef'
              },
              info: [
                { label: 'Topic', value: 'Marine Biology', header: true },
                { label: 'Conservation', value: 'Critical' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'OceanX',
            link: 'https://oceanx.org'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'The Art of Storytelling in Modern Cinema',
        content: [
          {
            title: 'Evolving Narratives',
            text: 'How storytelling techniques have evolved with technology in films.',
            info: {
              title: 'Cinematic Tales',
              image: {
                src: 'path/to/cinema_story.jpg',
                alt: 'Film Reel'
              },
              info: [
                { label: 'Topic', value: 'Filmography', header: true },
                { label: 'Medium', value: 'Movies' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'IMDb',
            link: 'https://imdb.com'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'Space Exploration: The Final Frontier',
        content: [
          {
            title: 'Journey to Mars',
            text: 'The challenges and opportunities of sending humans to the red planet.',
            info: {
              title: 'Mars Mission',
              image: {
                src: 'path/to/mars_mission.jpg',
                alt: 'Mars Landscape'
              },
              info: [
                { label: 'Topic', value: 'Astronomy', header: true },
                { label: 'Goal', value: 'Colonization' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'NASA',
            link: 'https://nasa.gov'
          }
        ],
        author: user._id,
        status: 'published'
    },
    {
        title: 'The Renaissance of Classical Music',
        content: [
          {
            title: 'Classical Music in the Modern Age',
            text: "How classical music remains relevant in today's musical landscape.",
            info: {
              title: 'Orchestral Waves',
              image: {
                src: 'path/to/classical_music.jpg',
                alt: 'Orchestra Performance'
              },
              info: [
                { label: 'Topic', value: 'Music', header: true },
                { label: 'Genre', value: 'Classical' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'Classical FM',
            link: 'https://classicalfm.com'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'Virtual Reality: The New Frontier of Gaming',
        content: [
          {
            title: 'Immersive Gaming Experiences',
            text: 'Exploring the advancements and implications of VR in gaming.',
            info: {
              title: 'Gaming in 3D',
              image: {
                src: 'path/to/vr_gaming.jpg',
                alt: 'VR Gaming Setup'
              },
              info: [
                { label: 'Topic', value: 'Technology', header: true },
                { label: 'Trend', value: 'Rising' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'VR World',
            link: 'https://vrworld.com'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'Gourmet Coffee: More than Just a Drink',
        content: [
          {
            title: 'The Art and Science of Coffee Brewing',
            text: 'Diving into the world of artisanal coffee and its cultural impact.',
            info: {
              title: 'Coffee Chronicles',
              image: {
                src: 'path/to/coffee_cup.jpg',
                alt: 'Artisanal Coffee'
              },
              info: [
                { label: 'Topic', value: 'Culture', header: true },
                { label: 'Popularity', value: 'Global' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'Coffee Connoisseur',
            link: 'https://coffeeconnoisseur.com'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'The Evolution of Urban Planning',
        content: [
          {
            title: 'Modern Cities and Urban Design',
            text: 'Understanding the transformation of cities through strategic urban planning.',
            info: {
              title: 'Cityscapes',
              image: {
                src: 'path/to/cityscape.jpg',
                alt: 'Modern City'
              },
              info: [
                { label: 'Topic', value: 'Architecture', header: true },
                { label: 'Focus', value: 'Urban' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'Urban Design Institute',
            link: 'https://urbandesign.org'
          }
        ],
        author: user._id,
        status: 'published'
      },
      {
        title: 'Deep Dive into Digital Art',
        content: [
          {
            title: 'The Rise of Digital Artists',
            text: 'How digital platforms are changing the face of artistry.',
            info: {
              title: 'Art in Pixels',
              image: {
                src: 'path/to/digital_art.jpg',
                alt: 'Digital Art Piece'
              },
              info: [
                { label: 'Topic', value: 'Art', header: true },
                { label: 'Medium', value: 'Digital' }
              ]
            }
          }
        ],
        references: [
          {
            name: 'ArtStation',
            link: 'https://artstation.com'
          }
        ],
        author: user._id,
        status: 'published'
      }
  ];
};

const seedData = async () => {
    try {
      const sampleArticles = await createSampleArticles();
      for (let article of sampleArticles) {
        try {
          await Article.create(article);
          console.log(`Article ${article.title} seeded!`);
        } catch (error) {
          console.error(`Error seeding article ${article.title}:`, error.errors);
        }
      }
      mongoose.connection.close();
    } catch (error) {
      console.error('Error seeding articles:', error);
    }
  };

seedData();

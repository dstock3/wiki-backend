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
      title: 'Spider-Man',
      intro: 'Spider-Man is a fictional superhero created by Stan Lee and Steve Ditko.',
      content: [
        {
          title: 'Origin',
          text: 'Spider-Man gained his powers after being bitten by a radioactive spider during a science experiment. This granted him abilities like wall-crawling, web shooting, and spider sense.',
        },
        {
          title: 'Powers',
          text: 'Spider-Man has superhuman strength, speed, stamina, agility, durability, healing, and senses. He uses these powers to fight crime in New York City.',
        }
      ],
      infoBox: {
        title: 'Alt Identities',
        info: [
          {label: 'Real Name', value: 'Peter Parker'},
          {label: 'Other Aliases', value: 'Friendly Neighborhood Spider-Man, Web Head'}
        ]
      },
      references: [
        {name: 'Marvel Wiki', link: 'https://marvel.fandom.com/wiki/Spider-Man_(Peter_Parker)'},
        {name: 'Wikipedia', link: 'https://en.wikipedia.org/wiki/Spider-Man'}
      ],
      author: null,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-15'),
      status: 'published'
    },
    {
      title: 'Green Goblin',
      intro: "The Green Goblin is one of Spider-Man's major enemies.",
      content: [
        {
          title: 'Origin',
          text: 'The original Green Goblin is Norman Osborn, who gained enhanced strength and intellect but went insane after ingesting a special serum.',
        },
        {  
          title: 'Powers',
          text: 'The Green Goblin has superhuman strength, reflexes, stamina and intellect. He uses a variety of weapons like pumpkin bombs, razor bats and his goblin glider.',
        }
      ],
      infoBox: {
        title: 'Real Identity',
        info: [
          {label: 'Name', value: 'Norman Osborn'},
          {label: 'Occupation', value: 'CEO of Oscorp Industries'}
        ]
      },
      references: [
        {name: 'Marvel Database', link: 'https://marvel.fandom.com/wiki/Green_Goblin_(Norman_Osborn)_(Earth-616)'}
      ],
      author: null,
      createdAt: new Date('2018-05-15'),
      updatedAt: new Date('2018-12-01'),
      status: 'published'
    },
    {
      title: 'Daily Bugle',
      intro: 'The Daily Bugle is a New York City tabloid newspaper that frequently defames Spider-Man.',
      content: [
        {
         title: 'History',
         text: 'The Bugle was founded in 1898. It is published by J. Jonah Jameson, who uses it to criticize Spider-Man.',
        },
        {
         title: 'Staff',
         text: 'Peter Parker works at the Bugle as a photographer to provide pictures of Spider-Man.', 
        }
      ],
      references: [
        {name: 'Marvel Wiki', link: 'https://marvel.fandom.com/wiki/Daily_Bugle'}
      ],
      author: null,
      createdAt: new Date('2021-03-01'),
      updatedAt: new Date('2021-08-15'),
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

const mongoose = require('mongoose');
const Portal = require('../model/portal');
const Article = require('../model/article')

mongoose.connect('mongodb://localhost:27017/wiki_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedPortals = async () => {
    try {
        const articles = await Article.find().limit(10);
  
        if (articles.length === 0) {
            console.log('No articles found in the database. Please seed articles first.');
            return;
        }

        const portalData = {
            portalTitle: 'Sample Portal Title',
            portalDescription: 'This is a sample portal description.',
            portalImage: {
                src: 'path_to_image.jpg', 
                alt: 'Sample Portal Image Alt Text'
            },
            articles: articles.map(article => article._id), 
            featuredArticle: articles[0]._id, 
            recentUpdates: articles.slice(0, 5).map(article => article._id) 
        };
    
        await Portal.create(portalData);
        console.log('Portal seeded successfully.');
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      mongoose.connection.close();
    }
};

seedPortals();
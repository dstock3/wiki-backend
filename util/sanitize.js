const sanitizeHtml = require('sanitize-html');

const sanitizeContent = (content) => {
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  });
  return sanitizedContent;
};

module.exports = sanitizeContent;
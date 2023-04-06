const getPostById = `*[_type == 'posts' && _id == $currentDocumentId][0]{
    _id, _createdAt, 'image':image.asset->url, text, owner,
    "actions": {
       likes, "likesCount":count(likes),
       "isLiked": likes[]._ref != null && owner._ref in likes[]._ref
    }
 }`;

module.exports = getPostById;

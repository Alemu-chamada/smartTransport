const mapPost = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    author_id: row.author_id,
    author_name: row.author_name,
    title: row.title,
    content: row.content,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

const mapComment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    author_name: row.author_name,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

module.exports = {
  mapPost,
  mapComment
};

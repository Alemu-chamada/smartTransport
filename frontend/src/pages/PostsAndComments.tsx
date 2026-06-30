import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import { Modal } from "../shared/ui/Modal";
import { Heart, MessageCircle, Share2, Send, User, Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { postApi, type Post, type Comment } from "../features/post/services";
import { useAuth } from "../providers/AuthProvider";

export function PostsAndComments() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const isAdmin = user?.role === "system_admin" || user?.role === "traffic_authority";

  // ── edit/delete state ──────────────────────────────────────────────
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editCommentId, setEditCommentId] = useState<{ postId: string; commentId: string } | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await postApi.getAllPosts();
        if (data?.posts) {
          setPosts(data.posts);
          // Auto-load comments for all posts
          data.posts.forEach((post: any) => {
            loadComments(post.id);
          });
          // Expand comments on all posts by default
          const expanded: Record<string, boolean> = {};
          data.posts.forEach((post: any) => { expanded[post.id] = true; });
          setExpandedComments(expanded);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const loadComments = async (postId: string) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const data = await postApi.getCommentsByPostId(postId);
      if (data?.comments) {
        setComments((prev) => ({ ...prev, [postId]: data.comments }));
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    // Load comments if not yet loaded
    if (!comments[postId]) {
      loadComments(postId);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      const data = await postApi.createComment(postId, { content: commentText });
      if (data?.comment) {
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment],
        }));
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsCreatingPost(true);
    try {
      const data = await postApi.createPost({
        title: newPostTitle.trim(),
        content: newPostContent.trim()
      });
      if (data?.post) {
        setPosts((prev) => [data.post, ...prev]);
        setIsCreatePostModalOpen(false);
        setNewPostTitle("");
        setNewPostContent("");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const data = await postApi.toggleLike(postId);
      if (data?.post) {
        setPosts((prev) => prev.map((post) => post.id === postId ? data.post : post));
      }
    } catch (error) { console.error("Failed to toggle like:", error); }
  };

  const handleToggleCommentLike = async (postId: string, commentId: string) => {
    try {
      const data = await postApi.toggleCommentLike(postId, commentId);
      if (data?.comment) {
        setComments((prev) => ({
          ...prev,
          [postId]: prev[postId].map((c) => c.id === commentId ? data.comment : c),
        }));
      }
    } catch (error) { console.error("Failed to toggle comment like:", error); }
  };

  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/community#post-${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Smart Transport Post", url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast("Link copied successfully!");
        setTimeout(() => setShareToast(null), 3000);
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShareToast("Link copied successfully!");
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post and all its comments?")) return;
    try {
      await postApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) { console.error("Failed to delete post:", error); }
  };

  const handleEditPost = async () => {
    if (!editPostId) return;
    try {
      const data = await postApi.editPost(editPostId, { title: editPostTitle, content: editPostContent });
      if (data?.post) setPosts((prev) => prev.map((p) => p.id === editPostId ? data.post : p));
      setEditPostId(null);
    } catch (error) { console.error("Failed to edit post:", error); }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await postApi.deleteComment(postId, commentId);
      setComments((prev) => ({ ...prev, [postId]: prev[postId].filter((c) => c.id !== commentId) }));
    } catch (error) { console.error("Failed to delete comment:", error); }
  };

  const handleEditComment = async () => {
    if (!editCommentId) return;
    try {
      const data = await postApi.editComment(editCommentId.postId, editCommentId.commentId, { content: editCommentText });
      if (data?.comment) {
        setComments((prev) => ({
          ...prev,
          [editCommentId.postId]: prev[editCommentId.postId].map((c) =>
            c.id === editCommentId.commentId ? data.comment : c
          ),
        }));
      }
      setEditCommentId(null);
    } catch (error) { console.error("Failed to edit comment:", error); }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Community Feed
              </h1>
              <p className="text-muted-foreground">
                Share experiences and connect with other travelers
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreatePostModalOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Post
              </Button>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground">
                  Check back later for updates from traffic authorities
                </p>
              </Card>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{post.author_name}</p>
                            <p className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {/* Admin/author actions on post */}
                        {(user?.role === "system_admin" || post.author_id === user?.id) && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditPostId(post.id); setEditPostTitle(post.title); setEditPostContent(post.content); }}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Edit post">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete post">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        )}
                      </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {post.title}
                  </h3>
                  <p className="text-foreground mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-6 pb-4 border-b border-border">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className="flex items-center gap-2 transition-colors hover:opacity-80"
                    >
                      <Heart className={`h-5 w-5 transition-colors ${post.is_liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${post.is_liked ? "text-red-500" : "text-muted-foreground"}`}>{post.like_count || 0}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-2 transition-colors ${expandedComments[post.id] ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">
                        {commentsLoading[post.id] ? "..." : `${comments[post.id]?.length ?? 0} comments`}
                      </span>
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Comments section — always shown when expanded */}
                  {expandedComments[post.id] && (
                    <div className="mt-4">
                      {commentsLoading[post.id] ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading comments…
                        </div>
                      ) : comments[post.id]?.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {comments[post.id].map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 bg-muted/50 rounded-xl p-3">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground">{comment.author_name}</p>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {/* comment owner or admin actions */}
                                  {(user?.role === "system_admin" || comment.author_id === user?.id) && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      {comment.author_id === user?.id && (
                                        <button onClick={() => { setEditCommentId({ postId: post.id, commentId: comment.id }); setEditCommentText(comment.content); }}
                                          className="p-1 rounded hover:bg-muted transition-colors" title="Edit comment">
                                          <Pencil className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                      )}
                                      <button onClick={() => handleDeleteComment(post.id, comment.id)}
                                        className="p-1 rounded hover:bg-red-50 transition-colors" title="Delete comment">
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-foreground">{comment.content}</p>
                                {/* Comment like button */}
                                <button
                                  onClick={() => handleToggleCommentLike(post.id, comment.id)}
                                  className="flex items-center gap-1 mt-1.5 transition-colors hover:opacity-80">
                                  <Heart className={`h-3.5 w-3.5 ${comment.is_liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                                  <span className={`text-xs ${comment.is_liked ? "text-red-500" : "text-muted-foreground"}`}>{comment.like_count || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2 mb-3">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ""}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <Modal isOpen={isCreatePostModalOpen} onClose={() => setIsCreatePostModalOpen(false)} title="Create New Post">
          <div className="space-y-4">
            <Input label="Title" placeholder="Enter post title..." value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content</label>
              <textarea placeholder="Write your post here..." value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]" />
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsCreatePostModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreatePost} loading={isCreatingPost}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}>Create Post</Button>
            </div>
          </div>
        </Modal>

        {/* Edit Post Modal */}
        <Modal isOpen={!!editPostId} onClose={() => setEditPostId(null)} title="Edit Post">
          <div className="space-y-4">
            <Input label="Title" value={editPostTitle} onChange={(e) => setEditPostTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content</label>
              <textarea value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[160px]" />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setEditPostId(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleEditPost}
                disabled={!editPostTitle.trim() || !editPostContent.trim()}>Save Changes</Button>
            </div>
          </div>
        </Modal>

        {/* Edit Comment Modal */}
        <Modal isOpen={!!editCommentId} onClose={() => setEditCommentId(null)} title="Edit Comment">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Comment</label>
              <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]" />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setEditCommentId(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleEditComment} disabled={!editCommentText.trim()}>Save</Button>
            </div>
          </div>
        </Modal>

        {/* Share toast */}
        {shareToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-foreground text-background text-sm font-semibold shadow-xl animate-fade-in">
            ✅ {shareToast}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../routes/MainLayout";
import { Card } from "../shared/ui/Card";
import { Button } from "../shared/ui/Button";
import { Input } from "../shared/ui/Input";
import { Modal } from "../shared/ui/Modal";
import { Heart, MessageCircle, Share2, Send, User, Loader2, Plus, X } from "lucide-react";
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
        setPosts((prev) => 
          prev.map((post) => 
            post.id === postId ? data.post : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
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
                  <div className="flex gap-4 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {post.author_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
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
                      className={`flex items-center gap-2 transition-colors ${
                        post.is_liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`} />
                      <span className="text-sm">{post.like_count || 0}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        expandedComments[post.id] ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">
                        {commentsLoading[post.id] ? "..." : `${comments[post.id]?.length ?? 0} comments`}
                      </span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium text-foreground">{comment.author_name}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground">{comment.content}</p>
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

        <Modal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          title="Create New Post"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter post title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content
              </label>
              <textarea
                placeholder="Write your post here..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCreatePostModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreatePost}
                loading={isCreatingPost}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
              >
                Create Post
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

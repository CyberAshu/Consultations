import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { Heart, MessageCircle, User, Calendar, Tag, Search } from 'lucide-react';

interface Comment {
  id: number;
  text: string;
  author: string;
  timestamp: string;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  readTime?: string;
  image?: string;
}

// Blog Card Component
const BlogCard = ({ blog, onReadMore }: { blog: BlogPost; onReadMore: (id: number) => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image Section */}
          <div className="w-48 h-48 flex-shrink-0">
            <img 
              src={blog.image || 'https://via.placeholder.com/200x200?text=Blog+Image'} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-6">
            {/* Date */}
            <p className="text-sm text-gray-500 mb-2">{formatDate(blog.date)}</p>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
              {blog.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-3">
              {blog.excerpt}
            </p>
            
            {/* Read More Button */}
            <Button 
              onClick={() => onReadMore(blog.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Read More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Sidebar Component
const Sidebar = () => {
  const [email, setEmail] = useState('');

  const categories = [
    { name: 'Immigration Policy', count: 8 },
    { name: 'Study Permits', count: 5 },
    { name: 'Express Entry', count: 12 },
    { name: 'Work Permits', count: 6 },
    { name: 'Family Sponsorship', count: 4 }
  ];

  const recentPosts = [
    'Understanding Canadian Immigration Policies in 2024',
    'Study Permit Applications: Tips for Success',
    'Express Entry Updates: What Changed in 2024',
    'Work Permit Guide for International Students',
    'Family Class Immigration: Complete Guide'
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <div className="w-80 space-y-8">
      {/* Categories */}
      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Categories</h4>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index} className="flex justify-between items-center">
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  {category.name}
                </a>
                <span className="text-gray-500 text-sm">({category.count})</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h4>
          <ul className="space-y-3">
            {recentPosts.map((post, index) => (
              <li key={index}>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors text-sm line-clamp-2">
                  {post}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Newsletter Subscription */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Subscribe to Our Newsletter</h4>
          <p className="text-gray-600 mb-4 text-sm">
            Get the latest immigration updates and tips delivered to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Subscribe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual Blog Detail Page Component
const BlogDetailPage = ({ 
  blog, 
  user, 
  onLike, 
  onComment, 
  newComment, 
  setNewComment, 
  onBack 
}: { 
  blog: BlogPost;
  user: any;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  onBack: () => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        onClick={onBack}
        className="mb-6 bg-gray-600 hover:bg-gray-700 text-white"
      >
        ← Back to Blog List
      </Button>
      
      <Card className="bg-white shadow-lg">
        <CardContent className="p-8">
          {/* Blog Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(blog.date)}</span>
              </div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {blog.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
            {blog.image && (
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {blog.content}
            </div>
          </div>

          {/* Engagement Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => onLike(blog.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  blog.isLiked 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-5 w-5 ${blog.isLiked ? 'fill-current' : ''}`} />
                <span>{blog.likes} {blog.likes === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="h-5 w-5" />
                <span>{blog.comments.length} {blog.comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>

            {/* Comment Form */}
            <div className="mb-6 bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Join the discussion</h4>
              <div className="flex space-x-4">
                {user && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Share your thoughts..." : "Please log in to comment"}
                    disabled={!user}
                    className="mb-3"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onComment(blog.id);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => onComment(blog.id)}
                    disabled={!user || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {blog.comments.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Comments ({blog.comments.length})
                </h4>
                {blog.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-4 bg-white rounded-lg border border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Blog Page Component
export function BlogPage() {
  const [user, setUser] = useState<{email: string, role: string, isAuthenticated: boolean} | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState<BlogPost[]>([
    {
      id: 1,
      title: 'Understanding Canadian Immigration Policies in 2024',
      excerpt: 'A comprehensive guide to the latest changes in Canadian immigration policies and what they mean for prospective immigrants.',
      content: 'Canadian immigration policies have undergone significant changes in 2024, affecting various programs including Express Entry, Provincial Nominee Programs, and Family Class sponsorship. This comprehensive guide will walk you through the most important updates and their implications for your immigration journey.\n\nThe Express Entry system has seen improvements in processing times, with most applications now being processed within 6 months. Additionally, new categories have been introduced to prioritize candidates with specific skills in healthcare, STEM fields, and trades.\n\nProvincial Nominee Programs have also expanded, with several provinces increasing their nomination allocations. This presents more opportunities for candidates who may not qualify through federal programs.',
      author: 'Admin Team',
      date: '2024-01-15',
      category: 'Immigration Policy',
      likes: 24,
      isLiked: false,
      readTime: '5 min',
      comments: [
        {
          id: 1,
          text: 'Very informative article! Thanks for the detailed breakdown.',
          author: 'Sarah Johnson',
          timestamp: '2024-01-16T10:30:00Z'
        },
        {
          id: 2,
          text: 'This helped me understand the new Express Entry changes.',
          author: 'Mike Chen',
          timestamp: '2024-01-16T14:45:00Z'
        }
      ],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Study Permit Applications: Tips for Success',
      excerpt: 'Essential tips and common mistakes to avoid when applying for a Canadian study permit.',
      content: 'Applying for a Canadian study permit can be complex, but with the right preparation, you can significantly increase your chances of success. Here are the key factors that immigration officers consider when reviewing study permit applications.\n\nFirst and foremost, you need to demonstrate that you have been accepted by a designated learning institution (DLI). Your letter of acceptance must be genuine and from an institution that is authorized to host international students.\n\nFinancial support is another critical factor. You must prove that you can support yourself and any accompanying family members during your stay in Canada. This includes tuition fees, living expenses, and return transportation costs.',
      author: 'Immigration Expert',
      date: '2024-01-10',
      category: 'Study Permits',
      likes: 18,
      isLiked: false,
      readTime: '3 min',
      comments: [],
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Express Entry Updates: What Changed in 2024',
      excerpt: 'The latest Express Entry updates and how they affect your immigration strategy.',
      content: 'The Express Entry system continues to evolve, and 2024 has brought several important changes that could impact your immigration strategy. Understanding these updates is crucial for maximizing your chances of receiving an invitation to apply.\n\nOne of the most significant changes is the introduction of category-based selection. This means that candidates with specific skills or work experience in certain fields may receive priority processing. The categories include Healthcare, STEM occupations, Trades, Transport, and Agriculture and agri-food.',
      author: 'RCIC Specialist',
      date: '2024-01-20',
      category: 'Express Entry',
      likes: 32,
      isLiked: false,
      readTime: '4 min',
      comments: [
        {
          id: 3,
          text: 'Great breakdown of the category-based selection!',
          author: 'Alex Rodriguez',
          timestamp: '2024-01-21T09:15:00Z'
        }
      ],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
    }
  ]);
  
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLike = (id: number) => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }

    setBlogs(prev =>
      prev.map(blog =>
        blog.id === id
          ? {
              ...blog,
              likes: blog.isLiked ? blog.likes - 1 : blog.likes + 1,
              isLiked: !blog.isLiked
            }
          : blog
      )
    );
  };

  const handleComment = (id: number) => {
    if (!user) {
      alert('Please log in to comment');
      return;
    }

    const comment = newComment.trim();
    if (!comment) return;

    const newCommentObj: Comment = {
      id: Date.now(),
      text: comment,
      author: user.email.split('@')[0],
      timestamp: new Date().toISOString()
    };

    setBlogs(prev =>
      prev.map(blog =>
        blog.id === id
          ? { ...blog, comments: [...blog.comments, newCommentObj] }
          : blog
      )
    );

    setNewComment('');
  };

  const handleReadMore = (id: number) => {
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      setSelectedBlog(blog);
    }
  };

  const handleBackToList = () => {
    setSelectedBlog(null);
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If viewing individual blog
  if (selectedBlog) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <BlogDetailPage
          blog={selectedBlog}
          user={user}
          onLike={handleLike}
          onComment={handleComment}
          newComment={newComment}
          setNewComment={setNewComment}
          onBack={handleBackToList}
        />
      </main>
    );
  }

  // Main blog list view
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Immigration Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest immigration news, tips, and expert insights.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg w-full rounded-lg shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Blog List - Left Side */}
          <div className="flex-1">
            <div className="space-y-8">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onReadMore={handleReadMore}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No blogs found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <Sidebar />
        </div>

        {/* Login CTA for non-authenticated users */}
        {!user && (
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg max-w-md mx-auto">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Join the Community</h3>
                <p className="text-gray-600 mb-6">Log in to like posts and share your thoughts in the comments.</p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold">
                  <a href="/login">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

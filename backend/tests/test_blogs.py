import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from supabase import Client
from datetime import datetime

# Mock blog posts data that matches BlogPostInDB schema
mock_blog_posts = [
    {
        "id": 1,
        "title": "Blog Post 1",
        "content": "Content 1",
        "slug": "blog-post-1",
        "author_id": 1,
        "category": "Tech",
        "likes_count": 5,
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:00:00Z",
        "excerpt": "Blog post 1 excerpt",
        "tags": "tech,programming",
        "image_url": "https://example.com/image1.jpg",
        "read_time": "5 min",
        "is_published": True,
        "comments": []
    },
    {
        "id": 2,
        "title": "Blog Post 2",
        "content": "Content 2",
        "slug": "blog-post-2",
        "author_id": 2,
        "category": "Science",
        "likes_count": 3,
        "created_at": "2024-01-02T10:00:00Z",
        "updated_at": "2024-01-02T10:00:00Z",
        "excerpt": "Blog post 2 excerpt",
        "tags": "science,research",
        "image_url": "https://example.com/image2.jpg",
        "read_time": "3 min",
        "is_published": True,
        "comments": []
    }
]

class TestBlogEndpoints:
    """Test blog endpoints"""

    @patch('app.api.deps.get_db')
    def test_read_blog_posts(self, mock_get_db, client):
        """Test reading all blog posts"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = mock_blog_posts
        mock_table.select.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/blogs/")
        assert response.status_code == 200
        assert len(response.json()) == 2

    @patch('app.api.deps.get_db')
    def test_search_blog_posts(self, mock_get_db, client):
        """Test searching for blog posts"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [mock_blog_posts[0]]
        mock_table.select.return_value.ilike.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/blogs/search?query=Post 1")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == "Blog Post 1"

    @patch('app.api.deps.get_db')
    def test_read_blog_post(self, mock_get_db, client):
        """Test reading a single blog post"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [mock_blog_posts[0]]
        mock_table.select.return_value.eq.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/blogs/1")
        assert response.status_code == 200
        assert response.json()["title"] == "Blog Post 1"

    def test_read_blog_post_not_found(self, client):
        """Test reading a blog post that does not exist"""
        with patch('app.api.deps.get_db') as mock_get_db:
            mock_db = Mock(spec=Client)
            mock_table = Mock()
            mock_db.table.return_value = mock_table
            mock_response = Mock()
            mock_response.data = []
            mock_table.select.return_value.eq.return_value.execute.return_value = mock_response
            mock_get_db.return_value = mock_db
            
            response = client.get("/api/v1/blogs/999")
            assert response.status_code == 404

    @patch('app.api.deps.get_db')
    def test_create_blog_post(self, mock_get_db, admin_client):
        """Test creating a new blog post as admin"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [mock_blog_posts[0]]
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        # Create a proper blog post request
        blog_data = {
            "title": "New Blog Post",
            "content": "New blog content",
            "category": "Tech",
            "excerpt": "New excerpt",
            "is_published": True
        }
        
        response = admin_client.post("/api/v1/blogs/", json=blog_data)
        assert response.status_code == 200

    def test_create_blog_post_not_admin(self, authenticated_client):
        """Test creating a blog post as a non-admin user"""
        blog_data = {
            "title": "New Blog Post",
            "content": "New blog content",
            "category": "Tech"
        }
        response = authenticated_client.post("/api/v1/blogs/", json=blog_data)
        assert response.status_code == 403

    @patch('app.api.deps.get_db')
    def test_update_blog_post(self, mock_get_db, admin_client):
        """Test updating a blog post as admin"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [mock_blog_posts[0]]
        mock_table.update.return_value.eq.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        blog_data = {
            "title": "Updated Blog Post",
            "content": "Updated content",
            "category": "Tech"
        }
        
        response = admin_client.put("/api/v1/blogs/1", json=blog_data)
        assert response.status_code == 200

    @patch('app.api.deps.get_db')
    def test_create_comment(self, mock_get_db, authenticated_client):
        """Test creating a comment on a blog post"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [{"id": 1, "content": "Test comment", "post_id": 1, "author_id": 1}]
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = authenticated_client.post(
            "/api/v1/blogs/1/comments",
            json={"content": "Test comment"}
        )
        assert response.status_code == 200

    @patch('app.api.deps.get_db')
    def test_like_blog_post(self, mock_get_db, authenticated_client):
        """Test liking a blog post"""
        # Need to change user_id to integer to match schema
        mock_user = {
            "id": 123,  # Changed to integer
            "email": "test@example.com",
            "full_name": "Test User",
            "role": "client"
        }
        
        # Override the current user for this test
        from app.main import app
        from app.api.deps import get_current_user
        
        def override_get_current_user():
            return mock_user
        
        app.dependency_overrides[get_current_user] = override_get_current_user
        
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [{"id": 1, "post_id": 1, "user_id": 123}]
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = authenticated_client.post("/api/v1/blogs/1/like")
        
        # Clean up override
        app.dependency_overrides.clear()
        
        assert response.status_code == 200

    @patch('app.api.deps.get_db')
    def test_read_blog_categories(self, mock_get_db, client):
        """Test reading blog categories"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = [{"category": "Tech"}, {"category": "Science"}]
        mock_table.select.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/blogs/categories")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @patch('app.api.deps.get_db')
    def test_read_recent_posts(self, mock_get_db, client):
        """Test reading recent blog posts"""
        mock_db = Mock(spec=Client)
        mock_table = Mock()
        mock_db.table.return_value = mock_table
        mock_response = Mock()
        mock_response.data = mock_blog_posts[:3]  # Recent posts
        mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_response
        mock_get_db.return_value = mock_db
        
        response = client.get("/api/v1/blogs/recent")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface Bookmark {
  id: number;
  link: string;
  userId: number;
  updated_at: Date;
  created_at: Date;
  content: string;
  folderId: number;
  name: string;
}

function EditFolder() {
  const { id } = useParams<{ id: string }>();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch bookmarks for the specified folder ID
    async function fetchBookmarks(folderId: number) {
      setLoading(true);
      try {
        // Fetching bookmarks
        const response = await fetch(`https://backend-mini-app-buildpsace-2d3f53b0a656.herokuapp.com/api/bookmarks/folder/${folderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }
        const data: Bookmark[] = await response.json();
        setBookmarks(data);
      } catch (error) {
        setError('Failed to fetch bookmarks');
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    }
    // Convert the route param id to number and fetch bookmarks
    const folderId = parseInt(id || ''); // Use empty string as default value if id is undefined
    fetchBookmarks(folderId);

    // Clean-up function (optional)
    return () => {
      // Cleanup logic if needed
    };
  }, [id]); // Dependency on id ensures re-fetching when id changes

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div>
      <h2>Edit Folder</h2>
      {loading ? (
        <p>Loading bookmarks...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          {bookmarks.map(bookmark => (
            <li key={bookmark.id}>
              <div className='flex justify-between space-x-10'>
                <a href={bookmark.link} className="menu-link">
                  {truncateName(bookmark.name, 30)}
                </a>
                <div className='flex space-x-4'>
                  <Link to={`/edit-folder`}
                        className="text-white hover:underline">Mark as read</Link>
                  <Link to={`/edit-folder`}
                        className="text-white hover:underline">Edit</Link>
                  <Link to={`/edit-folder`}
                  className="text-white hover:underline">Delete</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EditFolder;

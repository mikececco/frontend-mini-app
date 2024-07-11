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
  const [showModal, setShowModal] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookmarks(folderId: number) {
      setLoading(true);
      try {
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
    const folderId = parseInt(id || '');
    fetchBookmarks(folderId);

    return () => {};
  }, [id]);

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const handleEditClick = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBookmark(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedBookmark) {
      setSelectedBookmark({
        ...selectedBookmark,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookmark) {
      try {
        const response = await fetch(`http://localhost:5000/api/bookmarks/${selectedBookmark.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: selectedBookmark.name,
            link: selectedBookmark.link,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update bookmark');
        }

        // Update bookmarks state with the edited bookmark
        setBookmarks(prevBookmarks =>
          prevBookmarks.map(bookmark =>
            bookmark.id === selectedBookmark.id ? selectedBookmark : bookmark
          )
        );

        // Display success message
        setSuccessMessage('Saved!');

        // Hide modal and clear selected bookmark
        handleCloseModal();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (error) {
        console.error('Error updating bookmark:', error);
        setError('Failed to update bookmark');
      }
    }
  };

  return (
    <div>
      <Link to="/" className="block mb-4 text-blue-500 hover:underline">
        &lt; Back to Previous Page
      </Link>
      <h2>Edit Folder</h2>
      {loading ? (
        <p>Loading bookmarks...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          {bookmarks.map(bookmark => (
            <li key={bookmark.id}>
              <div className='flex justify-between space-x-10 items-center pt-5'>
                <a href={bookmark.link} className="menu-link">
                  {truncateName(bookmark.name, 30)}
                </a>
              </div>
              <div className='border-b border-gray-300 pb-5'>
                <Link to={`/edit-folder`} className="rounded px-4 py-2 text-xs text-green-500 hover:bg-green-500 hover:text-green-100 duration-300">Mark as read</Link>
                <button onClick={() => handleEditClick(bookmark)} className="rounded px-4 py-2 text-xs text-white hover:bg-white hover:text-black duration-300">Edit</button>
                <Link to={`/edit-folder`} className="rounded px-4 py-2 text-xs text-red-500 hover:bg-red-500 hover:text-red-100 duration-300">Delete</Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && selectedBookmark && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black opacity-50 w-full h-full absolute"></div>
          <div className="bg-white rounded-lg p-4 z-50">
            <div className="flex items-center">
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <p className="font-bold">Edit Bookmark</p>
                <form onSubmit={handleSubmit}>
                  <label className="block text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={selectedBookmark.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                  />
                  <label className="block text-sm font-bold mb-2">Link</label>
                  <input
                    type="text"
                    name="link"
                    value={selectedBookmark.link}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                  />
                  <div className="text-center md:text-right mt-4 md:flex md:justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-2"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default EditFolder;

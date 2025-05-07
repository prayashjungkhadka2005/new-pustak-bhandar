import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const staticBooks = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 12.99 },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 10.99 },
  { id: 3, title: '1984', author: 'George Orwell', price: 9.99 },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', price: 8.99 },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 11.99 },
  { id: 6, title: 'Moby-Dick', author: 'Herman Melville', price: 13.99 },
  { id: 7, title: 'War and Peace', author: 'Leo Tolstoy', price: 14.99 },
  { id: 8, title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 10.49 },
  { id: 9, title: 'Brave New World', author: 'Aldous Huxley', price: 9.49 },
  { id: 10, title: 'The Odyssey', author: 'Homer', price: 12.49 },
  { id: 11, title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', price: 13.49 },
  { id: 12, title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', price: 15.99 },
];

const PAGE_SIZE = 4;

const Dashboard = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [authorFilter, setAuthorFilter] = useState('');

  // Get unique authors for filter dropdown
  const authors = useMemo(() => [
    ...new Set(staticBooks.map(b => b.author))
  ], []);

  // Filter, search, and sort books
  const filteredBooks = useMemo(() => {
    let books = staticBooks;
    if (authorFilter) {
      books = books.filter(b => b.author === authorFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      books = books.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s)
      );
    }
    books = books.slice(); // copy
    books.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortBy === 'price') {
        cmp = a.price - b.price;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return books;
  }, [search, sortBy, sortOrder, authorFilter]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortOrder, authorFilter]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">Book Catalogue</h1>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            className="input"
            placeholder="Search by title or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            className="input"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            className="input"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Author</label>
          <select
            className="input"
            value={authorFilter}
            onChange={e => setAuthorFilter(e.target.value)}
          >
            <option value="">All</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {paginatedBooks.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500">No books found.</div>
        ) : (
          paginatedBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow p-5 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{book.title}</h2>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              <p className="text-primary-600 font-bold mb-4">${book.price.toFixed(2)}</p>
              <Link to={`/dashboard/book/${book.id}`} className="btn btn-primary mt-auto">View Details</Link>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center items-center gap-2">
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="mx-2 text-gray-700">Page {page} of {totalPages}</span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 
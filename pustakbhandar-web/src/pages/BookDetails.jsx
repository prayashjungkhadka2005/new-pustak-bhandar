import React from 'react';
import { useParams, Link } from 'react-router-dom';

const staticBooks = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 12.99, description: 'A classic novel set in the Roaring Twenties.' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 10.99, description: 'A story of racial injustice and childhood innocence.' },
  { id: 3, title: '1984', author: 'George Orwell', price: 9.99, description: 'A dystopian novel about totalitarianism and surveillance.' },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', price: 8.99, description: 'A romantic novel about manners and marriage.' },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 11.99, description: 'A coming-of-age story of teenage rebellion.' },
  { id: 6, title: 'Moby-Dick', author: 'Herman Melville', price: 13.99, description: 'An epic tale of obsession and revenge.' },
  { id: 7, title: 'War and Peace', author: 'Leo Tolstoy', price: 14.99, description: 'A sweeping novel of love and war in Russia.' },
  { id: 8, title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 10.49, description: 'A fantasy adventure preceding The Lord of the Rings.' },
  { id: 9, title: 'Brave New World', author: 'Aldous Huxley', price: 9.49, description: 'A futuristic society driven by technology and control.' },
  { id: 10, title: 'The Odyssey', author: 'Homer', price: 12.49, description: 'An ancient Greek epic poem of adventure and homecoming.' },
  { id: 11, title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', price: 13.49, description: 'A psychological drama of guilt and redemption.' },
  { id: 12, title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', price: 15.99, description: 'A philosophical novel about faith, doubt, and family.' },
];

const BookDetails = () => {
  const { id } = useParams();
  const book = staticBooks.find(b => b.id === Number(id));

  if (!book) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Book Not Found</h2>
        <Link to="/dashboard" className="btn btn-secondary">Back to Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-primary-700">{book.title}</h1>
      <p className="text-lg text-gray-700 mb-2">by {book.author}</p>
      <p className="text-primary-600 font-bold mb-4 text-xl">${book.price.toFixed(2)}</p>
      <p className="mb-6 text-gray-600">{book.description}</p>
      <Link to="/dashboard" className="btn btn-secondary">Back to Catalogue</Link>
    </div>
  );
};

export default BookDetails; 
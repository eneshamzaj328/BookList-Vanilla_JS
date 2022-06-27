//? Selectors
let $ = (selectorType, selector) => {
    if (selectorType === 'class') {
        return document.querySelector(selector);
    } else if (selectorType === 'id') {
        return document.getElementById(selector);
    } else {
        return document.querySelectorAll(selector);
    }
}

//? Books Data
let books = JSON.parse(localStorage.getItem('books')) || [];
let bookData = {
    id: undefined,
    title: $('id', 'title'),
    author: $('id', 'author'),
    isbn: $('id', 'isbn'),
    editing: false
}

//? Create Books
class Book {
    constructor(id, title, author, isbn) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

//? UI Class
class UI {
    static displayBooks() {

        $('id', 'book-list').innerHTML = '';
        books.forEach((book) => UI.addBookToLists(book));

        let booksContainer = $('class', '.table-books');
        if (books.length === 0) {
            booksContainer.classList.add('d-none');
            $('id', 'books').innerHTML += `
            <div class="empty alert alert-info text-center w-75 mx-auto mb-5">No books were Found!</div>
            `;
        } else {
            booksContainer.classList.remove('d-none');
            let boxMsg = $('class', '.empty');
            if (boxMsg) boxMsg.remove();
        }
    }

    static addBookToLists(book) {
        let { id, title, author, isbn } = book;

        const bookList = $('id', 'book-list');

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${title}</td>
            <td>${author}</td>
            <td>${isbn}</td>
            <td class="d-flex">
                <button id=${id} class="btn btn-danger delete me-3"><i class="fa-solid fa-trash"></i></button>
                <button id=edit-${id} class="btn btn-primary edit"><i class="fa-solid fa-edit"></i></button>
            </td>
            `;
        bookList.appendChild(tr);
    }

    static generateId = () => Math.floor(Math.random() * 99999);

    static addBook(book) {
        books.push(book);
        this.addBookToLists(book);
        Store.saveLocally(books);
        this.displayBooks();
    }

    static editBook(book) {
        let { id, title, author, isbn, editing } = book;
        let search = books.find((x) => 'edit-' + x.id === id);

        if (search !== undefined) {
            search.title = title.value;
            search.author = author.value;
            search.isbn = isbn.value;
        }

        bookData.editing = false;
        changeEditState();

        Store.saveLocally(books);
        this.displayBooks();
    }

    static removeBook(element) {
        if (element.classList.contains('delete')) {
            this.deleteBook(element.id);
            element.parentElement.parentElement.remove();
        }
    }

    static deleteBook(id) {
        books.forEach((book, index) => {
            if (book.id === parseInt(id)) {
                books.splice(index, 1);
            }
        });
        Store.saveLocally(books);
        this.alertMsg('success', 'Book Deleted!');
        this.displayBooks();
    }

    static alertMsg(alert, message) {
        const parentDiv = $('class', '.book-lists_form'),
            nextDiv = $('id', 'books-form');
        const div = document.createElement('div');
        div.className = `alert alert-${alert} mb-4 w-75 mx-auto`;
        div.innerHTML = message;
        parentDiv.insertBefore(div, nextDiv);

        setTimeout(() => div.remove(), 3000);
    }
}

//? Store Class
class Store {
    static saveLocally(books) {
        if (books !== null || books !== undefined) {
            localStorage.setItem('books', JSON.stringify(books));
        }
    }
}

//? Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks());

//? Event: Add a Book || Edit
const form = $('id', 'books-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //? inputs
    let title = $('id', 'title').value,
        author = $('id', 'author').value,
        isbn = $('id', 'isbn').value;

    let bookExists = books.some((book) => {
        if (book.title === title || book.isbn === isbn) {
            return true;
        }

        return false;
    });

    if (title !== '' && author !== '' && isbn !== '') {

        if (bookExists === false && bookData.editing === false) {
            const book = new Book(UI.generateId(), title, author, isbn);
            UI.addBook(book);
            UI.alertMsg('success', 'Book Added!');
            form.reset();
        } else {

            if (bookData.editing === true) {
                UI.editBook(bookData);
                UI.alertMsg('success', 'Book Updated Successfully!');
                form.reset();
            } else {
                UI.alertMsg('danger', 'Book Exists, Please try Again!');
            }

        }
    } else {
        UI.alertMsg('danger', 'Please fill in all Fields');
    }
});

//? Edit State
let changeEditState = (callback) => {
    let cancel = $('class', '.cancel');

    cancel.addEventListener('click', callback);

    if (bookData.editing === true && bookData.editing !== 'off') {
        cancel.classList.remove('d-none');

        $('id', 'submit').value = 'Edit Book';
    } else {
        $('id', 'submit').value = 'Submit';
        cancel.classList.add('d-none');
        $('id', 'books-form').reset();
    }
}

//? Edit
let editBook = (elem) => {
    if (elem.classList.contains('edit')) {

        let id = elem.id;
        let search = books.find((x) => {
            let searchId = 'edit-' + String(x.id);
            if (searchId === id) {
                return true;
            }

            return false;
        });

        if (search !== undefined) {
            title.value = search.title;
            author.value = search.author;
            isbn.value = search.isbn;
            bookData.id = id;
            bookData.editing = !bookData.editing;
        }

        let cancel = $('class', '.cancel');
        changeEditState(() => {
            elem.click();
            cancel.classList.add('d-none')
        });

        for (let i = 0; i < 3; i++) {
            $('all', 'input[type="text"]')[i].style = 'padding: .7rem .75rem !important';
            $('all', 'label')[i].style = 'all: unset';
        }
    }
}

//? Event: Edit && Remove Book
const bookList = $('id', 'book-list');
if (bookList) bookList.addEventListener('click', (e) => {
    let item = e.target;

    editBook(item);

    UI.removeBook(item);
});

//? Input Label
let inputs = $('all', 'input[type="text"]');
inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const inputValue = input.value;
        const inputText = $('all', 'input[type="text"]')[index],
            label = $('all', 'label')[index],
            labelFocus = $('all', 'div:focus-within label')[index];

        if (inputValue.length > 0) {
            inputText.style = 'padding: .7rem .75rem !important';
            label.style.all = 'unset';
            if (labelFocus) labelFocus.style = 'position: static';
        } else if (inputValue.length === 0) {
            inputText.removeAttribute('style');
            label.removeAttribute('style');
            if (labelFocus) labelFocus.removeAttribute('style');
        } else return;
    });
});
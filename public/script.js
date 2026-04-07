const JAVA_API = 'http://localhost:8082/api';

function calculateIssuedDate(daysOverdue) {
    const date = new Date();
    date.setDate(date.getDate() - daysOverdue);
    return date.toLocaleDateString('ru-RU');
}

document.getElementById('calculateBtn').addEventListener('click', async () => {
    const bookId = document.getElementById('bookId').value;
    const resultDiv = document.getElementById('result');
    const errorP = document.getElementById('error');

    resultDiv.classList.add('hidden');
    errorP.classList.add('hidden');

    if (!bookId || bookId.trim() === "") {
        errorP.textContent = "Введите ID книги";
        errorP.classList.remove('hidden');
        return;
    }
  if (parseInt(bookId) < 0) {
        errorP.textContent = "ID не может быть отрицательным";
        errorP.classList.remove('hidden');
        return;
    }

    try {
        const bookResp = await fetch(`${JAVA_API}/books/${bookId}`);
        
        if (bookResp.status === 404) {
            throw new Error('Книга с таким ID не найдена');
        }
        if (!bookResp.ok) {
            throw new Error('Ошибка сервера');
        }
        
        const book = await bookResp.json();

        const fineResp = await fetch(`${JAVA_API}/calculate-fine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });
        
        if (!fineResp.ok) {
            throw new Error('Ошибка при расчете штрафа');
        }
        
        const totalFine = await fineResp.json();
  const issuedDateStr = calculateIssuedDate(book.daysOverdue);

        
        document.getElementById('fineAmount').textContent = totalFine.toFixed(2);
        document.getElementById('issuedDate').textContent = issuedDateStr;
        document.getElementById('dailyRate').textContent = book.dailyRate;
        document.getElementById('daysOverdue').textContent = book.daysOverdue;
        document.getElementById('returnStatus').textContent = book.isReturned ? "Возвращена" : "На руках";
        
        resultDiv.classList.remove('hidden');

    } catch (err) {
        errorP.textContent = err.message;
        errorP.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    }
});
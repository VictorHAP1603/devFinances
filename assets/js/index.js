
const Modal = {
    modalContainer: document.querySelector('.modal-container'),
    modal: document.querySelector('.modal'),
    open() {
        this.modalContainer.classList.add('open-modal')
        Utils.click(this.modal, ['click'], () => this.close())
    },

    close() {
        this.modalContainer.classList.remove('open-modal')
    }
}

const LocalStorageUpdate = {
    get() {
       return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
       localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transactions = {
    all: LocalStorageUpdate.get(),

    add(transaction) {
        Transactions.all.push(transaction)

        App.reload();
    },
    
    remove(index) {
        Transactions.all.splice(index, 1)

        App.reload();
    },

    incomes() {
        let soma = 0;
        Transactions.all.forEach(t => {
            const amount = t.amount;
            if (amount > 0) {
                soma += amount
            }
        })

        return soma
    },

    expense() {
        let soma = 0;
        Transactions.all.forEach(t => {
            const amount = t.amount;
            if (amount < 0) {
                soma += amount
            }
        })
        return soma
    },

    total() {
        return this.incomes() + this.expense();
    }
}

const DOM = {
    tbody: document.querySelector('tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index;
        this.tbody.append(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount)

        const text = `
        <td>${transaction.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td>${transaction.date}</td>
        <td class="remove" onclick="Transactions.remove(${index})">X</td>
        `

        return text
    },

    updateBalance() {
        document
            .querySelector('[data-balance="entrada"]')
            .innerHTML = Utils.formatCurrency(Transactions
                .incomes())

        document
            .querySelector('[data-balance="saida"]')
            .innerHTML = Utils.formatCurrency(Transactions
                .expense())

        document
            .querySelector('[data-balance="total"]')
            .innerHTML = Utils.formatCurrency(Transactions
                .total())

    },

    clearTransaction() {
        this.tbody.innerHTML = '';
    }

}

const Utils = {
    html: document.documentElement,
    buttonClose: document.querySelector('.cancel'), 

    click(element, $events, callback) {
        $events.forEach($event => setTimeout(() => this.html.addEventListener($event, handleClick)))

        function handleClick({ target }) {
            if (!element.contains(target) || Utils.buttonClose.contains(target)) {
                $events.forEach($event => setTimeout(() => Utils.html.removeEventListener($event, handleClick)))
                callback();
            }
        }
    },

    formatCurrency(amount) {
        const signal = Number(amount) > 0 ? "" : "-";
        
        amount = String(amount).replace(/\D/g, "")
        amount = (amount / 100).toLocaleString('pt-BR', { style: "currency", currency: "BRL" })
        
        const formatvalue = `${signal} ${amount}`;

        return formatvalue
    },

    formatAmount(amount) {
        amount = Number(amount.replace(/\.\,/g, "")) * 100
        return amount
    },

    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('[data-modal="description"]'),
    amount: document.querySelector('[data-modal="price"]'),
    date: document.querySelector('[data-modal="date"]'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues();
        
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    validateFields()  {
        const { description, amount, date } = this.getValues();

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por Favor, preencha todos os campos")
        }

    },

    saveTransaction(transaction) {
        Transactions.add(transaction)
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            // verificar se os campos foram preenchidos
            Form.validateFields();
            // formatar dados para salvar
            const transaction = Form.formatValues();
            // Salvar
            // salvar no localStorage
            Form.saveTransaction(transaction)
            // apagar os dados do formulario
            Form.clearFields();
        } catch (error) {
            alert(error.message)
        }

    } 
}

const App = {
    init() {
        DOM.clearTransaction()
        Transactions.all.forEach((transaction, index) => DOM.addTransaction(transaction, index));
        DOM.updateBalance();

        LocalStorageUpdate.set(Transactions.all);
    },
    reload() {
        App.init();
    }
}


App.init()







// Functions Utils















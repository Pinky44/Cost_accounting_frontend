let allCosts = [];
let activeEditTask = null;
const url = `http://localhost:8000/costs`;
const headers = {
  "Content-Type": "application/json;charset=utf-8",
  "Access-Control-Allow-Origin": "*",
};

window.onload = () => {
  getCost();
};

const render = () => {
  const content = document.getElementById("content-page");
  
  if (content === null) {
    return;
  }

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allCosts.forEach((item, index) => {
    const { text: storeName, count, date, _id } = item;
    const container = document.createElement("li");
    container.id = `task-${_id}`;
    container.className = "task-container";

    if (_id === activeEditTask) {
      const inputTask = document.createElement("input");
      inputTask.type = "text";
      inputTask.value = storeName;
      container.appendChild(inputTask);

      const inputCosts = document.createElement("input");
      inputCosts.type = "number";
      inputCosts.value = count;
      container.appendChild(inputCosts);

      const inputDate = document.createElement("input");
      inputDate.type = "date";
      inputDate.value = moment(date).format("YYYY-MM-DD");
      container.appendChild(inputDate);

      const imageDone = document.createElement("img");
      imageDone.src = "media/done.svg";
      imageDone.alt = "done";
      imageDone.className = "general_img";
      const buttonDone = document.createElement("button");
      buttonDone.onclick = () => {
        activeEditTask = null;
        doneEditCost(_id, inputTask.value, inputCosts.value, inputDate.value);
      };

      buttonDone.appendChild(imageDone);
      container.appendChild(buttonDone);
    } else {
      const numbering = document.createElement("p");
      numbering.type = "text";
      numbering.className = "conclusion";
      numbering.innerText = `${index + 1})`;
      container.appendChild(numbering);

      const text = document.createElement("p");
      text.type = "text";
      text.className = "conclusion";
      text.innerText = storeName;

      const datePurchase = document.createElement("p");
      datePurchase.className = "conclusion";
      datePurchase.innerText = moment(date).format("DD.MM.YYYY");

      const expenses = document.createElement("p");
      expenses.innerText = count + " p.";

      container.appendChild(text);
      container.appendChild(datePurchase);
      container.appendChild(expenses);

      const imageEdit = document.createElement("img");
      imageEdit.src = "media/pencil.svg";
      imageEdit.alt = "pencil";
      imageEdit.className = "general_img";
      const buttonEdit = document.createElement("button");
      buttonEdit.onclick = () => {
        activeEditTask = _id;
        render();
      };
      buttonEdit.appendChild(imageEdit);
      container.appendChild(buttonEdit);
    }

    const imageDelete = document.createElement("img");
    imageDelete.src = "media/cansel.svg";
    imageDelete.alt = "cancel";
    imageDelete.className = "general_img";
    const buttonDelete = document.createElement("button");
    buttonDelete.onclick = () => {
      deleteCostOne(_id);
    };
    buttonDelete.appendChild(imageDelete);
    container.appendChild(buttonDelete);
    content.appendChild(container);
  });
  const total = document.getElementById("total");

  if (total === null) {
    return;
  }

  const sumWithInitial = allCosts.reduce((sum, currentValue) => {
    return sum + currentValue.count;
  }, 0);
  total.innerText = `Итого: ${sumWithInitial} р.`;
};

const getCost = async () => {
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    const result = await response.json();
    allCosts = result.result;
    render();
  } catch (error) {
    showError("Ошибка получение расходов");
  }
};

const deleteCostOne = async (id) => {
  try {
    const response = await fetch(url + `/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.deletedCount === 1) {
      allCosts = allCosts.filter((item) => id !== item._id);
      render();
    }

  } catch (error) {
    showError("Ошибка удаления");
  }
};

const doneEditCost = async (id, storeName, count, date) => {
  try {

    if (storeName.trim() === "" || date.trim() === "" || count.trim() === "") {
      showError("Поле не может быть пустым");
      return;
    }

    const response = await fetch(url + `/text/${id}`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({
        text: storeName,
        date: date,
        count: count,
      }),
    });
    const result = await response.json();
    allCosts.find((el) => {

      if (result._id === el._id) {
        el.text = result.text;
        el.date = result.date;
        el.count = result.count;
      }
    });
    render();
  } catch (error) {
    showError("Ошибка изменения текста");
  }
};

const addNewCost = async () => {
  try {
    const count = document.getElementById("spent-sum");
    const input = document.getElementById("shopname");

    if (count === null || input === null) {
      return;
    }

    if (count.value.trim() === "" || input.value.trim() === "") {
      showError("Поле не может быть пустым");
      return;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        text: input.value,
        count: count.value,
      }),
    });
    const result = await response.json();
    allCosts.push(result);
    input.value = "";
    count.value = "";
    showError("");
    render();
  } catch (error) {
    showError("Поле не может быть пустым");
  }
};

const showError = (error) => {
  const textError = document.getElementById("error-message");
  if (textError === null) {
    return;
  }
  textError.innerText = error;
};

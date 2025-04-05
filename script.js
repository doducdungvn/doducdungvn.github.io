// Hàm khởi tạo giá trị mặc định
function initializeDefaultValues() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`result${i}`).textContent = "0";
    document.getElementById(`bonusResult${i}`).textContent = "0";
  }
  document.getElementById('total').textContent = "0";
  document.getElementById('bonusTotal').textContent = "0";
  document.getElementById('finalResult').textContent = "0";
}

// Hàm chuyển đổi định dạng input
function convertInputFormat(input) {
  return input.replace(/,/g, '.');
}

// Hàm lưu shortcuts vào localStorage
function saveShortcuts() {
  const shortcutsInput = document.getElementById("shortcuts").value;
  localStorage.setItem("shortcutsData", shortcutsInput);
}

// Hàm load shortcuts từ localStorage
function loadShortcuts() {
  const shortcutsData = localStorage.getItem("shortcutsData");
  if (shortcutsData) {
    document.getElementById("shortcuts").value = shortcutsData;
  }
}

// Hàm tính toán chính
function calculateSum() {
  const numbersInput = document.getElementById("numbers").value;
  const convertedInput = convertInputFormat(numbersInput)
    .replace(/=/g, "x")
    .replace(/\+/g, "x");
  
  const numbersArray = convertedInput.split("\n").filter(line => line.trim() !== "");
  const retainNumber = parseInt(document.getElementById("retainNumber").value) || 0;
  const result = document.getElementById("result");
  const modifiedResult = document.getElementById("modifiedResult");
  const shortcutsInput = document.getElementById("shortcuts").value;
  const shortcutsArray = shortcutsInput.split("\n");
  const shortcuts = {};
  
  // Tạo danh sách shortcuts
  for (let i = 0; i < shortcutsArray.length; i++) {
    const shortcutParts = shortcutsArray[i].split("=");
    const shortcutName = shortcutParts[0]?.trim().toLowerCase();
    const shortcutValue = shortcutParts[1]?.trim();
    if (shortcutName && shortcutValue) {
      shortcuts[shortcutName] = shortcutValue;
    }
  }
  
  const sums = {};
  
  // Xử lý từng dòng số
  for (let i = 0; i < numbersArray.length; i++) {
    const parts = numbersArray[i].split(/[+x,\s]+/);
    let number = parts[0]?.trim().toLowerCase();
    if (!number) continue;
    
    // Áp dụng shortcut nếu có
    if (shortcuts[number]) {
      number = shortcuts[number];
    }
    
    const numberParts = number.split(".");
    const sum = parseInt(parts[1]) || 0;
    
    // Xử lý từng phần của số
    for (const numberPart of numberParts) {
      for (let j = 0; j < numberPart.length - 1; j++) {
        const pair = numberPart.slice(j, j + 2);
        sums[pair] = (sums[pair] || 0) + sum;
      }
    }
    
    // Xử lý các phép toán + và x
    for (let m = 2; m < parts.length; m++) {
      const operation = parts[m]?.charAt(0);
      const operand = parseInt(parts[m]?.substring(1)) || 0;
      
      if (operation === "+") {
        sums[number] = (sums[number] || 0) + operand;
      } else if (operation === "x") {
        sums[number] = (sums[number] || 0) * operand;
      }
    }
  }
  
  // Hiển thị kết quả
  result.innerHTML = "";
  modifiedResult.innerHTML = "";
  
  const sortedSums = Object.entries(sums).sort((a, b) => b[1] - a[1]);
  sortedSums.forEach(([key, value]) => {
    const div = document.createElement("div");
    div.textContent = `${key} = ${value}`;
    result.appendChild(div);
  });
  
  // Xử lý 27 giải
  const twentySevenNumbersInput = document.getElementById("twentySevenNumbers").value;
  const twentySevenNumbersArray = twentySevenNumbersInput.split(/\s+/).filter(n => n.trim());
  const matchingNumbers = {};
  let matchingSum = 0;
  
  for (const number of twentySevenNumbersArray) {
    const num = number.trim().toLowerCase();
    if (sums[num]) {
      matchingNumbers[num] = (matchingNumbers[num] || 0) + 1;
      matchingSum += sums[num];
    }
  }
  
  // Hiển thị chi tiết input
  const inputList = document.getElementById("inputList");
  inputList.innerHTML = "";
  
  numbersArray.forEach(number => {
    const li = document.createElement("li");
    li.textContent = number;
    inputList.appendChild(li);
  });
  
  // Xử lý giữ lại
  const retainType = document.querySelector('input[name="retainType"]:checked').value;
  let modifiedResultText = "";
  let modifiedTotalSum = 0;
  
  for (const [key, value] of Object.entries(sums)) {
    let modifiedSum;
    if (retainType === "money") {
      modifiedSum = value - retainNumber;
    } else {
      modifiedSum = value - (value * (retainNumber / 100));
    }
    
    if (modifiedSum >= 1) {
      modifiedSum = Math.trunc(modifiedSum);
      modifiedResultText += `${key}x${modifiedSum}<br>`;
      modifiedTotalSum += modifiedSum;
    }
  }
  
  modifiedResult.innerHTML = modifiedResultText;
  document.getElementById("modifiedTotalSum").textContent = modifiedTotalSum.toLocaleString("vi-VN");
  
  const totalSum = Object.values(sums).reduce((a, b) => a + b, 0);
  let totalSumText = totalSum.toLocaleString("vi-VN");
  
  if (matchingSum > 0) {
    totalSumText += `/${matchingSum.toLocaleString("vi-VN")}`;
  }
  
  document.getElementById("totalSum").textContent = totalSumText;
  
  // Đánh dấu số trùng
  const resultDivs = result.querySelectorAll("div");
  resultDivs.forEach(div => {
    const resultNumber = div.textContent.split(" = ")[0];
    if (matchingNumbers[resultNumber]) {
      div.classList.add("matching-number");
      if (matchingNumbers[resultNumber] > 1) {
        div.textContent += ` (${matchingNumbers[resultNumber]} nhay)`;
      }
    }
  });
  
  document.getElementById("numResults").textContent = `${sortedSums.length} con`;
}

// Hàm sao chép text
function copyText() {
  const textToCopy = document.getElementById("modifiedResult").innerText;
  copyToClipboard(textToCopy, "Đã sao chép thành công!");
}

// Hàm sao chép input list
function copyInputList() {
  const inputListContent = document.getElementById("inputList").innerText;
  copyToClipboard(inputListContent, "Đã sao chép input thành công!");
}

// Hàm helper để sao chép
function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => alert(successMessage))
      .catch(err => {
        console.error("Lỗi sao chép: ", err);
        alert("Sao chép thất bại. Vui lòng thử lại.");
      });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        alert(successMessage);
      } else {
        throw new Error("Sao chép không thành công");
      }
    } catch (err) {
      console.error("Lỗi sao chép: ", err);
      alert("Sao chép thất bại. Vui lòng thử lại.");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// Hàm chuẩn hóa 27 số
function normalizeTwentySevenNumbers() {
  const twentySevenNumbersInput = document.getElementById("twentySevenNumbers").value;
  const lines = twentySevenNumbersInput.split("\n");
  let normalizedInput = "";

  for (const line of lines) {
    const numbers = line.trim().split(/[;\t]/).filter(Boolean);
    if (numbers.length > 1) {
      numbers.shift();
      normalizedInput += numbers.join(" ") + " ";
    }
  }

  const finalNormalizedInput = normalizedInput.replace(/\s{2,}/g, ' ').trim();
  document.getElementById("twentySevenNumbers").value = finalNormalizedInput;
}

// Hàm tính kết quả cho từng dòng
function calculateResult(row) {
  const input = parseFloat(document.getElementById(`input${row}`).value) || 0;
  const bonus = parseFloat(document.getElementById(`bonus${row}`).value) || 0;
  const percentage = parseFloat(document.getElementById(`percentage${row}`).value) || 0;

  let result = 0;
  let bonusResult = 0;

  if (row === 3 || row === 4) {
    result = Math.round(input * percentage / 100);
    bonusResult = bonus;
  } else {
    result = Math.round(input * percentage / 100);
    bonusResult = Math.round(bonus * 80);
  }

  document.getElementById(`result${row}`).textContent = isNaN(result) ? "0" : result;
  document.getElementById(`bonusResult${row}`).textContent = isNaN(bonusResult) ? "0" : bonusResult;

  calculateTotal();
}

// Hàm tính tổng
function calculateTotal() {
  let total = 0;
  let bonusTotal = 0;

  for (let i = 1; i <= 4; i++) {
    total += parseInt(document.getElementById(`result${i}`).textContent) || 0;
    bonusTotal += parseInt(document.getElementById(`bonusResult${i}`).textContent) || 0;
  }

  document.getElementById('total').textContent = total;
  document.getElementById('bonusTotal').textContent = bonusTotal;
  calculateFinalResult();
}

// Hàm tính kết quả cuối cùng
function calculateFinalResult() {
  const total = parseInt(document.getElementById('total').textContent) || 0;
  const bonusTotal = parseInt(document.getElementById('bonusTotal').textContent) || 0;
  const finalResult = total - bonusTotal;

  document.getElementById('finalResult').textContent = finalResult;
}

// Hàm xử lý focus input
function clearDefaultValue(inputField) {
  if (inputField.value === "0") {
    inputField.value = "";
  }
}

// Hàm khôi phục giá trị mặc định
function restoreDefaultValue(inputField) {
  if (inputField.value === "") {
    inputField.value = "0";
    const rowNumber = parseInt(inputField.id.replace("input", "").replace("bonus", ""));
    if (!isNaN(rowNumber)) {
      calculateResult(rowNumber);
    }
  }
}

// Hàm xử lý dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Hàm kiểm tra dark mode preference
function checkDarkModePreference() {
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

// Hàm thiết lập event listeners
function setupEventListeners() {
  // Các nút chức năng chính
  document.getElementById('calculateButton').addEventListener('click', () => {
    calculateSum();
  });
  
  document.getElementById('normalizeButton').addEventListener('click', normalizeTwentySevenNumbers);
  document.getElementById('copyButton').addEventListener('click', copyText);
  document.getElementById('copyInputListButton').addEventListener('click', copyInputList);
  
  // Sự kiện cho bảng tính toán
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`input${i}`);
    const bonus = document.getElementById(`bonus${i}`);
    const percentage = document.getElementById(`percentage${i}`);
    
    input.addEventListener('focus', () => clearDefaultValue(input));
    input.addEventListener('blur', () => restoreDefaultValue(input));
    input.addEventListener('input', () => calculateResult(i));
    
    bonus.addEventListener('focus', () => clearDefaultValue(bonus));
    bonus.addEventListener('blur', () => restoreDefaultValue(bonus));
    bonus.addEventListener('input', () => calculateResult(i));
    
    percentage.addEventListener('focus', () => clearDefaultValue(percentage));
    percentage.addEventListener('blur', () => restoreDefaultValue(percentage));
    percentage.addEventListener('input', () => calculateResult(i));
  }
  
  // Sự kiện cho retainNumber
  const retainNumber = document.getElementById('retainNumber');
  retainNumber.addEventListener('focus', () => clearDefaultValue(retainNumber));
  retainNumber.addEventListener('blur', () => {
    if (retainNumber.value === "") {
      retainNumber.value = "0";
    }
  });
  
  // Sự kiện cho shortcuts
  document.getElementById('shortcuts').addEventListener('input', saveShortcuts);
  
  // Dark mode toggle
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
}

// Khởi tạo khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  initializeDefaultValues();
  loadShortcuts();
  setupEventListeners();
  checkDarkModePreference();
});

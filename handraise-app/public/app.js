document.getElementById("handForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const classId = document.getElementById("classId").value;
  const studentId = document.getElementById("studentId").value;
  const question = document.getElementById("question").value;

  const res = await fetch("/api/raise-hand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classId, studentId, question })
  });

  if (res.ok) {
    alert("挙手が送信されました！");
    document.getElementById("question").value = "";
  } else {
    alert("送信に失敗しました");
  }
});

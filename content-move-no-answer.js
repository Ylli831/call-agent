
(function moveNoAnswerToTop() {
  const container = document.getElementById('lead-WHOptions');
  if (!container) return;

  // Find all .clearfix groups inside the container
  const groups = Array.from(container.querySelectorAll('.clearfix'));
  if (!groups.length) return;

  // Look for the group that contains the "No Answer" button by matching the <h4>
  const noAnswerGroup = groups.find(group =>
    group.innerHTML.includes('<h4>No Answer</h4>')
  );

  if (!noAnswerGroup || noAnswerGroup === groups[0]) {
    // Group not found or already at the top
    return;
  }

  // Move the group to the top
  container.insertBefore(noAnswerGroup, groups[0]);
})();
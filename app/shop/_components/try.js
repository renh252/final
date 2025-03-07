import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

export default function HoverCollapse() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="container mt-3">
      <div
        className="btn btn-primary"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        滑鼠移入展開
      </div>

      <div className={`collapse ${isOpen ? "show" : ""}`}>
        <div className="card card-body mt-2">
          這是滑鼠移入後顯示的內容
        </div>
      </div>
    </div>
  );
}

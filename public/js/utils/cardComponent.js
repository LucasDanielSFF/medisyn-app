export function createCardLayout(cardId, options = {}) {
    const isRemovable = options.removable ?? true;
  
    return `
  <div class="col-12">
    <div class="card-medicamento card-wrapper" id="${cardId}">
      <div class="card-body">
        ${isRemovable ? `
          <div class="card-actions d-flex align-items-center mb-3">
            ${options.headerContent || ''}
          </div>` : ''
        }
        ${options.content || ''}
      </div>
    </div>
  </div>
`;
};
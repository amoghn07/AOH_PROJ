// ============================================================================
// Vendor Dispute Analyzer - Frontend Application
// ============================================================================

class DisputeAnalyzerApp {
  constructor() {
    this.currentResult = null;
    this.vendors = [];
    this.sampleEmails = [];
    this.init();
  }

  async init() {
    this.cacheDOMElements();
    this.attachEventListeners();
    await this.checkHealth();
    await this.loadVendors();
    await this.loadSampleEmails();
  }

  // ========== DOM & Events ==========

  cacheDOMElements() {
    this.form = document.getElementById('analyzeForm');
    this.vendorSelect = document.getElementById('vendorSelect');
    this.subjectInput = document.getElementById('subject');
    this.bodyInput = document.getElementById('body');
    this.loadingSpinner = document.getElementById('loadingSpinner');
    this.noResults = document.getElementById('noResults');
    this.resultsContent = document.getElementById('resultsContent');
    this.errorContent = document.getElementById('errorContent');
    this.sampleEmailsContainer = document.getElementById('sampleEmails');
    this.statusText = document.getElementById('statusText');
    this.healthStatus = document.getElementById('healthStatus');
  }

  attachEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => this.switchTab(e.target));
    });

    // Copy draft button
    const copyBtn = document.getElementById('copyDraftBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyDraftToClipboard());
    }

    // Action buttons
    document.getElementById('approveBtn')?.addEventListener('click', () =>
      this.handleApprove()
    );
    document.getElementById('reviewBtn')?.addEventListener('click', () =>
      this.handleReview()
    );
    document.getElementById('rejectBtn')?.addEventListener('click', () =>
      this.handleReject()
    );
  }

  // ========== API Calls ==========

  async checkHealth() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      if (response.ok) {
        this.updateStatus('ready', 'API Connected');
      } else {
        this.updateStatus('error', 'API Error');
      }
    } catch (error) {
      this.updateStatus('error', 'Connection Failed');
    }
  }

  async loadVendors() {
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();

      if (data.success) {
        this.vendors = data.vendors;
        this.populateVendorSelect();
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      this.showToast('Failed to load vendors', 'error');
    }
  }

  async loadSampleEmails() {
    try {
      const response = await fetch('/api/sample-emails');
      const data = await response.json();

      if (data.success) {
        this.sampleEmails = data.emails;
        this.populateSampleEmails();
      }
    } catch (error) {
      console.error('Failed to load sample emails:', error);
    }
  }

  async analyzeEmail(vendorId, subject, body) {
    try {
      this.showLoading(true);
      this.noResults.classList.add('hidden');
      this.resultsContent.classList.add('hidden');
      this.errorContent.classList.add('hidden');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      this.currentResult = data;
      this.displayResults(data);
      this.showToast('Analysis complete!', 'success');
    } catch (error) {
      console.error('Analysis error:', error);
      this.displayError(error.message);
      this.showToast('Analysis failed: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  // ========== UI Updates ==========

  populateVendorSelect() {
    this.vendorSelect.innerHTML =
      '<option value="">-- Select a Vendor --</option>';
    this.vendors.forEach((vendor) => {
      const option = document.createElement('option');
      option.value = vendor.id;
      option.textContent = `${vendor.name} (${vendor.email})`;
      this.vendorSelect.appendChild(option);
    });
  }

  populateSampleEmails() {
    this.sampleEmailsContainer.innerHTML = '';
    this.sampleEmails.forEach((email) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sample-btn';
      btn.innerHTML = `
        <div class="sample-btn-vendor">${email.from}</div>
        <div class="sample-btn-subject">${email.subject}</div>
      `;
      btn.addEventListener('click', () => {
        this.loadSampleEmail(email);
      });
      this.sampleEmailsContainer.appendChild(btn);
    });
  }

  loadSampleEmail(email) {
    const vendor = this.vendors.find((v) => v.id === email.vendorId);
    if (vendor) {
      this.vendorSelect.value = email.vendorId;
    }
    this.subjectInput.value = email.subject;
    this.bodyInput.value = email.body;
    this.showToast('Sample email loaded', 'success');
  }

  displayResults(data) {
    this.resultsContent.classList.remove('hidden');
    this.noResults.classList.add('hidden');

    // Case header
    document.getElementById('resultVendor').textContent = data.vendorName;
    document.getElementById('caseId').textContent = `Case: ${data.caseId}`;

    // Confidence badge
    const confidenceBadge = document.getElementById('confidenceBadge');
    confidenceBadge.className = `confidence-badge ${data.analysis.confidence}`;
    confidenceBadge.textContent = data.analysis.confidence.toUpperCase();

    // Metrics
    document.getElementById('recommendation').textContent = this.formatRecommendation(
      data.analysis.recommendation
    );
    document.getElementById('confidence').textContent =
      data.analysis.confidence.charAt(0).toUpperCase() +
      data.analysis.confidence.slice(1);
    document.getElementById('approvals').textContent =
      data.analysis.requiredApprovals.join(', ');

    // Tab content
    document.getElementById('reasoningContent').textContent =
      data.analysis.reasoning;
    document.getElementById('draftContent').textContent = data.draftResponse;
    document.getElementById('fullContent').textContent = data.fullAnalysis;

    // Reset active tab
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.remove('active');
    });
    document.querySelector('.tab-btn').classList.add('active');
    document.getElementById('reasoning').classList.add('active');
  }

  displayError(message) {
    this.errorContent.classList.remove('hidden');
    this.errorContent.innerHTML = `<strong>Error:</strong> ${message}`;
    this.noResults.classList.add('hidden');
    this.resultsContent.classList.add('hidden');
  }

  formatRecommendation(rec) {
    const map = {
      approve_payment: '✓ Approve Payment',
      reject_claim: '✗ Reject Claim',
      partial_payment: '≈ Partial Payment',
      further_investigation: '? Needs Investigation',
    };
    return map[rec] || rec;
  }

  switchTab(btn) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.remove('active');
    });

    // Add active to clicked tab
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  }

  updateStatus(state, text) {
    const dot = this.healthStatus.querySelector('.status-dot');
    if (state === 'ready') {
      dot.style.backgroundColor = '#10b981';
    } else if (state === 'error') {
      dot.style.backgroundColor = '#ef4444';
    }
    this.statusText.textContent = text;
  }

  showLoading(show) {
    if (show) {
      this.loadingSpinner.classList.remove('hidden');
    } else {
      this.loadingSpinner.classList.add('hidden');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  copyDraftToClipboard() {
    const draft = document.getElementById('draftContent').textContent;
    navigator.clipboard.writeText(draft).then(() => {
      this.showToast('Draft copied to clipboard!', 'success');
    });
  }

  // ========== Event Handlers ==========

  handleFormSubmit(e) {
    e.preventDefault();

    const vendorId = this.vendorSelect.value;
    const subject = this.subjectInput.value;
    const body = this.bodyInput.value;

    if (!vendorId || !subject || !body) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.analyzeEmail(vendorId, subject, body);
  }

  handleApprove() {
    if (!this.currentResult) return;
    this.showToast(
      `✓ Case ${this.currentResult.caseId} approved! Ready for Retool.`,
      'success'
    );
    // In real app, would send to Retool backend here
  }

  handleReview() {
    if (!this.currentResult) return;
    this.showToast(
      `? Case ${this.currentResult.caseId} marked for review.`,
      'warning'
    );
  }

  handleReject() {
    if (!this.currentResult) return;
    this.showToast(
      `✗ Case ${this.currentResult.caseId} rejected.`,
      'error'
    );
  }
}

// ============================================================================
// Initialize App
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  window.app = new DisputeAnalyzerApp();
});

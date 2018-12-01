var PLAID_PUBLIC_KEY = '';
var PLAID_ENV = 'sandbox';

/**
 * Plaid link object
 */
function plaidLink() {
	return window.Plaid.create({
    clientName: 'BudgetSheet',
    env: PLAID_ENV || 'sandbox',
    // Replace with your public_key from the Dashboard
    key: PLAID_PUBLIC_KEY,
    product: ['transactions'],
    onSuccess: function(publicToken, metadata) {
      document.getElementById('result-public-token').innerHTML = publicToken;

      console.log('Account publicToken =', publicToken);
      console.log('Account metadata =', metadata);
    },
    onExit: function(err, metadata) {
      // The user exited the Link flow.
      if (err !== null) {
        // The user encountered a Plaid API error prior to exiting.
        showConsoleError(err);
      }
    },
  });
}

function savePlaidInfoToLocalStorage() {
  localStorage.setItem('PLAID_PUBLIC_KEY', PLAID_PUBLIC_KEY);
  localStorage.setItem('PLAID_ENV', PLAID_ENV);
}

function clearLocalStorage() {
  localStorage.clear();
}

/**
 * Override console.error because that is the only way to show the users errors from Plaid... *sigh*
 */
function showConsoleError(err) {
  alert("PLAID ERROR:\n\n" + err.toString());
}

/**
 * Bind form click
 */
var formEl = document.getElementById('plaid-link-form');

formEl.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  var fields = e.target.elements;

  // Set Plaid account stuff...
  PLAID_PUBLIC_KEY = fields.namedItem('PLAID_PUBLIC_KEY').value;
  PLAID_ENV = fields.namedItem('PLAID_ENV').value;

  savePlaidInfoToLocalStorage();

  // Open box
  try {
    plaidLink().open();
  } catch (e) {
    showConsoleError(e);
  }
});

/**
 * On window load...
 */
window.addEventListener('load', function () {
  document.getElementById('PLAID_PUBLIC_KEY').value = localStorage.getItem('PLAID_PUBLIC_KEY');
  let envRadio = document.querySelector('input[value="' + localStorage.getItem('PLAID_ENV') + '"]');

  if (envRadio) {
    envRadio.checked = true;
  }

  // Fill in query string values if present, overriding localStorage values
  let qs = {};
  let queryString = location.search ? location.search.replace('?', '') : '';

  if (queryString.length > 1) {
    queryString.split('&').map(function (qsPart) {
      let qsParts = qsPart.split('=');

      qs[qsParts[0]] = decodeURIComponent(qsParts[1]);
    });

    if (qs.publicKey) {
      document.getElementById('PLAID_PUBLIC_KEY').value = qs.publicKey;
    }

    if (qs.env) {
      envRadio = document.querySelector('input[value="' + qs.env + '"]');

      if (envRadio) {
        envRadio.checked = true;
      }
    }
  }

  document.getElementById('localStorage-clear').addEventListener('click', function () {
    clearLocalStorage();
    location.reload();
  });
});

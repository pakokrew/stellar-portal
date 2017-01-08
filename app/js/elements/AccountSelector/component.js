import React, { Component, PropTypes } from 'react';
import { Button, Header, Input, Message } from 'semantic-ui-react'
import Clipboard from 'clipboard';

import * as StellarHelper from '../../helpers/StellarTools';

class AccountSelector extends Component {

  constructor(props) {
    super(props);

    this.state = {
      accountId: '',
      secretSeed: '',
      pkError: null,
      seedError: null,
    };
  }

  componentWillReceiveProps(newProps) {
    if(this.props.keypair !== newProps.keypair) {
      if(newProps.keypair) {
        this.setState({
          accountId: newProps.keypair.accountId(),
          secretSeed: newProps.keypair.canSign() ? newProps.keypair.seed() : '',
        });
      } else {
        this.setState({
          accountId: '',
          secretSeed: '',
        });
      }
    }
  }

  componentDidMount() {
    new Clipboard(".account-address-copy");

    const query = this.props.location.query;
    if(query.accountId || query.secretSeed) {
      this.props.setAccount({ publicKey: query.accountId, secretSeed: query.secretSeed });
    }
  }

  handleChangePK(e) {
    e.preventDefault();
    const accountId = e.target.value || '';
    this.setState({ pkError: !StellarHelper.validPk(accountId) });
    this.setState({
      accountId,
    });
  };

  handleChangeSeed(e) {
    e.preventDefault();
    const secretSeed = e.target.value || '';
    // TODO isValidSeed ?
    this.setState({
      secretSeed,
    });
  };

  getAccountFromPk(e) {
    e && e.preventDefault();
    if(!this.state.accountId) return;

    this.props.setAccount({ publicKey: this.state.accountId }, this.context.router);
  };

  getAccountFromSeed(e) {
    e && e.preventDefault();
    if(!this.state.secretSeed) return;

    this.props.setAccount({ secretSeed: this.state.secretSeed }, this.context.router);
  };

  render() {
    return (
      <div>
        <div>
          <Header as="h2">Account selector</Header>
        </div>
        <div>
          <Input
            action={{content: "Set", onClick: ::this.getAccountFromPk, loading: this.props.isAccountLoading}}
            input={{value: this.state.accountId}}
            onChange={::this.handleChangePK}
            placeholder='G...'
            label={{content: "Public key", className: 'AccountSelector-inputTitle'}}
            fluid
            error={this.state.pkError}
          />
          <Input
            action={{content: "Set", onClick: ::this.getAccountFromSeed, loading: this.props.isAccountLoading}}
            input={{value: this.state.secretSeed}}
            onChange={::this.handleChangeSeed}
            placeholder='S...'
            label={{content: "Secret seed", className: 'AccountSelector-inputTitle'}}
            fluid
            error={this.state.seedError}
          />
          <br/>
          {
            this.props.error ?
              <Message negative>
                <Message.Header>Account error</Message.Header>
                <p>There was an error while fetching this account's data.</p>
              </Message>
              :
              null
          }
          {this.props.keypair ?
            <div>

              <Button
                className="account-address-copy"
                basic
                color="green"
                data-clipboard-text={this.props.keypair.accountId()}
              >Copy public address</Button>
              {this.props.keypair.canSign() ?
                <Button
                  className="account-address-copy"
                  basic
                  color="blue"
                  data-clipboard-text={this.props.keypair.seed()}
                >Copy private address</Button>
                : null
              }
            </div>
            : null
          }
          <Button.Group>
            <Button
              color={this.props.network === 'test' ? "blue" : "grey"}
              basic
              onClick={() => this.props.switchNetwork('test')}
            >
              Testnet
            </Button>
            <Button
              color={this.props.network === 'public' ? "blue" : "grey"}
              basic
              onClick={() => this.props.switchNetwork('public')}
            >
              Public
            </Button>
          </Button.Group>
        </div>
      </div>
    );
  }
}

AccountSelector.propTypes = {
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  isAccountLoading: PropTypes.bool,
  account: PropTypes.object,
  error: PropTypes.object,
  keypair: PropTypes.object,
  setAccount: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  switchNetwork: PropTypes.func.isRequired,
};

AccountSelector.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default AccountSelector;

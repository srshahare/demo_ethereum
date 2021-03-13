import "./App.css";
import { FilePicker } from "react-file-picker-preview";
import { Component } from "react";
import Demo from "./Demo";
import { Button, Input } from "antd";
import Web3 from "web3";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
var QRCode = require("qrcode.react");
const EthereumTx = require("ethereumjs-tx").Transaction;

const web3 = new Web3("http://127.0.0.1:7545");
console.log(web3.eth);

class App extends Component {
  state = {
    file: {},
    reset: {},
    hash: "",
    privateKey: "",
    publicKey: "",
  };

  selecteFile = (file) => {
    const hash = web3.utils.sha3(`${file.name}+${file.lastModified}`);
    this.setState({ file, hash });
  };

  makeTransaction = () => {
    const { file, hash, privateKey, publicKey } = this.state;
    if (Object.keys(file).length === 0 && hash === "") {
      alert("Select the file before initiating the transaction!!");
    } else {
      if (privateKey === "" || publicKey === "") {
        alert(
          "Please type your public and private key before making a transaction!!"
        );
      } else {
        web3.eth.getTransactionCount(publicKey, (err, txCount) => {
          const privateKeyBuffer = Buffer.from(privateKey, "hex");
          
          //create transaction object
          const txObject = {
            nonce: web3.utils.toHex(txCount),
            gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
            gasLimit: web3.utils.toHex(1000000), //Raise this
            data: web3.utils.toHex(hash),
          };

          //sign the transaction
          const tx = new EthereumTx(txObject);
          tx.sign(privateKeyBuffer);

          const serializedTx = tx.serialize();
          const raw = "0x" + serializedTx.toString("hex");

          //Broadcast the transaction
          web3.eth
            .sendSignedTransaction(raw)
            .then((receipt) => {
              console.log("Receipt:", receipt);
              confirmAlert({
                title: 'Confirm to submit',
                message: 'Are you sure to do this.',
                buttons: [
                  {
                    label: 'Yes',
                    onClick: () => alert('Click Yes')
                  },
                  {
                    label: 'No',
                    onClick: () => alert('Click No')
                  }
                ]
              });
            })
            .catch((e) => {
              confirmAlert({
                customUI: ({ onClose }) => {
                  return (
                    <div className='custom-ui'>
                      <h1>Transaction Done!</h1>
                      <p>Transaction has been done successfully. Check Ganache to see the transaction list and further details.</p>
                      <Button type="primary" onClick={onClose}>Okay</Button>
                    </div>
                  );
                }
              });
              console.error("Error broadcasting the transaction: ", e);
            });
        });
      }
    }
  };

  render() {
    const { file, hash } = this.state;

    return (
      <div className="App">
        <Demo />
        <div className="main-container">
          <div className="top-container">
            <Button type="primary">
              <div
                onClick={() => {
                  this.setState({ reset: Object.assign({}) });
                }}
              >
                Clear the picker
              </div>
            </Button>
            <Button type="primary">
              <div>
                <FilePicker
                  className="button"
                  maxSize={2}
                  buttonText="Upload a file!"
                  // extensions={["application/pdf", "JPG"]}
                  onChange={this.selecteFile}
                  onError={(error) => {
                    alert("that's an error: " + error);
                  }}
                  onClear={() => this.setState({ file: {} })}
                  triggerReset={this.state.reset}
                >
                  {/* <div className="input-button" type="button">
                    The file picker
                  </div> */}
                </FilePicker>
              </div>
            </Button>
          </div>
          {hash !== "" && (
            <QRCode renderAs="svg" style={{ marginTop: "1rem" }} value={hash} />
          )}
          <div className="file-details">
            <h3>The file</h3>
            <h4>Name: {file.name}</h4>
            <h4>
              Size: {file.size}
              {file.size ? " bytes" : null}
            </h4>
            <h4>Type: {file.type}</h4>
            <h4>Modified: {file.lastModified}</h4>
          </div>
          <div className="details-box">
            <p>Public Key</p>
            <Input
              onChange={(e) => {
                this.setState({ publicKey: e.target.value });
              }}
              placeholder="Your Public Key"
            />
            <p>Private Key</p>
            <Input
              onChange={(e) => {
                this.setState({ privateKey: e.target.value });
              }}
              placeholder="Your Private Key"
            />
            <p>Calculated Hash Value:</p>
            <h4>{hash}</h4>
            <Button onClick={this.makeTransaction}>Make Transaction</Button>
          </div>
        </div>
      </div>
    );
  }
}
export default App;

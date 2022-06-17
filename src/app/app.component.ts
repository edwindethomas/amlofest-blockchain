import { FormControl, FormGroup } from "@angular/forms";
import {
  Component,
  AfterViewInit,
} from "@angular/core";
import { Web3Service } from "./services/web3.service";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements AfterViewInit {
  msgEstado = "No Conectado.";
  estado = false;
  resu = "";
  tokens = 0;
  bloque = "";
  numBloq = "";
  from = "";
  hashTrans = "";
  monto = "";
  tokensEnvi = "";
  puntos = 0;
  transacciones: any = [];

  qForm = new FormGroup({ query: new FormControl("") });
  enviTokFor = new FormGroup({
    dirCuenta: new FormControl(""),
    cantidad: new FormControl(""),
  });
  
  constructor(public web3s: Web3Service) {
  }
  
  ngAfterViewInit(): void {
    this.web3s.conectarCuenta().then((r) => {
      this.msgEstado = "Conectado.";
      this.estado = true;
      this.eventos();
    });
  }
  
  conectarCuenta(){
    this.web3s.conectarCuenta().then(() => {
      this.estado = true;
      this.msgEstado = "Conectado.";
      this.eventos();
    });
  }

  tokensEnviados(): void {
    this.web3s.contrato.methods
      .getRewardPoints()
      .call()
      .then((response: any) => {
        this.tokensEnviados = response;
      });
  }

  async balancePorCuenta(dirCuenta: any): Promise<any> {
    return await this.web3s.contrato.methods.balanceOf(dirCuenta).call();
  }

  async transferencia(): Promise<void> {
    this.resu = "";
    this.bloque = "";
    const cuentaVen = this.enviTokFor.get("cantidad")?.value;
    const dirCuenta = this.enviTokFor.get("dirCuenta")?.value;
    const balance = await this.balancePorCuenta(this.web3s.cuentas[0]);
    this.tokens = cuentaVen;
    this.web3s.contrato.methods
      .sendPoints(dirCuenta, cuentaVen, this.tokens, balance)
      .send({ from: this.web3s.cuentas[0] })
      .then((response: any) => {
        this.hashTrans = response.transactionHash;
        this.bloque = response.blockHash;
        this.from = response.from;
        this.numBloq = response.blockNumber;
        this.resu = "Transacción hecha";
      })
      .catch((error: any) => {
        console.log(error);
        this.resu = "Transacción fallida";
      });
  }

  async query(): Promise<void> {
    const consulta = this.qForm.get("query")?.value;
    const resu = await this.balancePorCuenta(consulta);
    this.puntos = resu;
  }

  eventos() {
    this.web3s.contrato.events.Transfer(
      {
        fromBlock: 0,
      },
      (error: any, event: any) => {
        if (!error) {
        }else{
          const abiDecoder = require("abi-decoder");
          abiDecoder.addABI(this.web3s.abi);
          this.web3s.web3js.eth
            .getTransaction(event.transactionHash)
            .then(async (data: any) => {
              const decodedData = abiDecoder.decodeMethod(data.input);

              if (decodedData) {
                this.monto = decodedData.params[1].value;
                this.tokensEnvi = decodedData.params[2].value;
                this.transacciones.push({
                  transaccion: event.transactionHash,
                  numero: event.blockNumber,
                  monto: this.monto,
                  tokens: this.tokensEnvi,
                  para: event.returnValues.to,
                });
              }
            });
        }
      }
    );
  }
}

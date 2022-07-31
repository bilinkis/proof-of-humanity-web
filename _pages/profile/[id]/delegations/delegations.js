import { Text } from "@kleros/components";
import fetch from "node-fetch";
import React from "react";
import { Button, Card, Col, message, Row, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
const { Title } = Typography;
import { FUBIAddress } from "subgraph/config";
import CreateDelegation from "./create-delegation";

export default class Delegations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usedRate: 0,
      loading: true,
      recievedFlows: [],
    };
  }
  subgraph = "https://api.thegraph.com/subgraphs/name/bilinkis/ubiv2-kovan";
  componentDidMount = () => {
    this.props.web3.contracts?.UBI?.methods
      .getAccruedPerSecond()
      .call()
      .then((accruedPerSecond) => {
        this.props.web3.contracts?.FUBI?.methods
          .getFlowsOf(this.props.submissionID)
          .call()
          .then((flowsOf) => {
            let flows = [];
            let totalRate = 0;
            if (flowsOf?.length > 0) {
              for (let i = 0; i < flowsOf.length; i++) {
                this.props.web3.contracts?.FUBI?.methods
                  .getDelegationInfo(flowsOf[i])
                  .call()
                  .then((flow) => {
                    flows.push({ id: flowsOf[i], ...flow });
                    totalRate += Number(flow.ratePerSecond);
                    this.setState({
                      usedRate: Math.round(
                        (totalRate / accruedPerSecond) * 100
                      ),
                    });
                  });
              }
            }
            this.setState({ flowsOf: flowsOf, flows: flows, loading: false });
          })
          .then(async () => {
            const query = `{\n  delegations(where:{recipient:"${this.props.submissionID}"}) {\n    id\n    owner\n    recipient\n    ratePerSecond\n  }\n}\n`;
            let delegations = await fetch(this.subgraph, {
              method: "POST",
              body: JSON.stringify({ query }),
              headers: {
                "Content-Type": "application/json",
              },
            });
            let { data } = await delegations.json();
            //console.log(data.delegations);
            this.setState({ recievedFlows: data.delegations });
          });
      });
      
  };
  cancelDelegation = (flowID) => {
    this.props.web3.contracts.UBI?.methods
      .cancelDelegation(FUBIAddress, flowID)
      .send({
        from: this.props.submissionID,
        value: 0,
      })
      .on("receipt", () => {
        window.location.reload(false);
      })
      .on("error", () => {
        message.error("There was an error with your transaction");
      });
  };

  render() {
    return (
      <>
        {this.state.loading ? (
          <Row justify="center">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: "10%" }} spin />}
            />
          </Row>
        ) : (
          <>
          <Title level={4} style={{ textAlign:"center",margin: "0 auto" }}>
                  Your current outgoing delegations
                </Title>
            {this.state.flows?.length > 0 ? (
              <>
                
                <Row justify="center" style={{ marginBottom: "20px" }}>
                  {this.state.flows.map((flow, i) => {
                    return (
                      <Col span={6} key={i}>
                        <Card>
                          <Text>Flow ID: {flow.id}</Text>
                          <Text>Flow recepient: {flow.recipient}</Text>
                          <Text>
                            UBI Rate:{" "}
                            {Math.round(
                              (flow.ratePerSecond / 280000000000000) * 100
                            )}
                            %
                          </Text>
                          <Button
                            className="button-orange"
                            onClick={() => this.cancelDelegation(flow.id)}
                            loading={this.state.loading}
                          >
                            Cancel this Delegation
                          </Button>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </>
            ) : (
              <>
              <Row justify="center">
                <Col span={12} style={{textAlign: 'center'}}>
                <Text>You don&apos;t have any outgoing delegations</Text>
                </Col>
                </Row>
              </>
            )}
            <Title level={4} style={{ textAlign:"center",margin: "0 auto" }}>
                  Your current incoming delegations
                </Title>
            {this.state.recievedFlows?.length > 0 ? (
              <>
                
                <Row justify="center" style={{ marginBottom: "20px" }}>
                  {this.state.recievedFlows?.map((flow, i) => {
                    return(
                    <Col span={6} key={i}>
                      <Card style={{border: "1px solid black"}}>
                        <Text>Flow ID: {flow.id}</Text>
                        <Text>Flow sender: {flow.owner}</Text>
                        <Text>
                          UBI Rate:{" "}
                          {Math.round(
                            (flow.ratePerSecond / 280000000000000) * 100
                          )}
                          %
                        </Text>
                      </Card>
                    </Col>);
                  })}
                </Row>
              </>
            ) : (
              <Text style={{textAlign: "center"}}>You don&apos;t have any incoming delegations</Text>
            )}

            {this.state.usedRate < 100 ? (
              <CreateDelegation
                submissionID={this.props.submissionID}
                web3={this.props.web3}
                usedRate={this.state.usedRate}
              />
            ) : (
              <Text>You don&apos;t have any UBI available to delegate</Text>
            )}
          </>
        )}
      </>
    );
  }
}

import React from 'react';
import { Header, Icon, Segment, Table } from 'semantic-ui-react';

const style = {
  height: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  borderRight: '1px solid #ccc',
};
const headerIconStyle = { fontSize: '0.8em', float: 'right' };

export default function HotkeysPanel({ labels, onClose }) {
  const labelHotkeys = labels.map((label, i) => (
    <Table.Row key={label}>
      <Table.Cell>{label}</Table.Cell>
      <Table.Cell>{i}</Table.Cell>
    </Table.Row>
  ));

  return (
    <div style={style}>
      <Header as="h2" attached="top">
        Hotkeys
        <Icon link name="close" style={headerIconStyle} onClick={onClose} />
      </Header>
      <Segment attached>
        <Header as="h3"> Labels </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Action</Table.HeaderCell>
              <Table.HeaderCell>Key</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{labelHotkeys}</Table.Body>
        </Table>
        <Header as="h3"> General </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Action</Table.HeaderCell>
              <Table.HeaderCell>Key</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>Complete shape</Table.Cell>
              <Table.Cell>f</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Change label</Table.Cell>
              <Table.Cell>c</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Delete figure</Table.Cell>
              <Table.Cell>Delete</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Cancel selection</Table.Cell>
              <Table.Cell>Escape</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Undo the edit</Table.Cell>
              <Table.Cell>Ctrl+Z</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Header as="h3"> Navigation </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Action</Table.HeaderCell>
              <Table.HeaderCell>Key</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>Zoom In</Table.Cell>
              <Table.Cell>+/=</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Zoom Out</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Move the Image</Table.Cell>
              <Table.Cell>←→↑↓</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Segment>
    </div>
  );
}

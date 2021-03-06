import React, { useEffect, useState } from 'react';
import {
  Paper,
  Button,
  List,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';

import ReactHotkeys from 'react-hot-keys';
import { sendMessage, useStorage } from './chrome';
import { Capture } from './Capture';

import { MyTheme } from '../../components/MyTheme';
import { JA, EN } from '../../components/locale';

const Popup = () => {
  const [list, setList] = useState([]);
  const [subs, setSubs] = useState(false);

  useStorage({ key: 'list' }, setList);
  useStorage({ key: 'subs' }, (subs) => {
    setSubs(subs);
    chrome.storage.sync.get(['iframe'], ({ iframe }) => capture(subs, iframe));
  });
  const iframe = useStorage({ key: 'iframe', storage: 'sync' });

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'listUpdated') {
        chrome.storage.local.get(['list'], (result) =>
          setList(result.list || [])
        );
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ subs });
  }, [subs]);

  const capture = (subs, iframe) => {
    const type = subs ? 'SUBS' : 'CAPTURE';
    sendMessage({ type, iframe });
  };

  return (
    <MyTheme>
      <Paper style={{ padding: '15px', borderRadius: 0 }}>
        <ReactHotkeys keyName="shift+c" onKeyUp={() => capture(subs, iframe)}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => capture(subs, iframe)}
          >
            <JA>キャプ</JA>
            <EN>Capture</EN>
          </Button>
          <span style={{ width: 10 }}>&nbsp;&nbsp;</span>
          <FormControlLabel
            label={
              <>
                <JA>字幕を含む</JA>
                <EN>with Subs</EN>
              </>
            }
            control={
              <Checkbox checked={subs} onChange={() => setSubs(!subs)} />
            }
          />
          <List>
            {list && list.map((l) => <Capture item={l} key={l.id} />)}
          </List>
        </ReactHotkeys>
      </Paper>
    </MyTheme>
  );
};

export default Popup;

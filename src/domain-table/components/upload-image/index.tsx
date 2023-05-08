import React, { FC, useCallback, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload, UploadFile } from 'antd';
import { render, unmountComponentAtNode } from 'react-dom';

import styles from './index.less';

interface UploadImageProps {
  value?: any;
  onChange?(value: any): void;
  maxCount?: number;
}

const UploadImage: FC<UploadImageProps> = (props) => {
  const { value = [], onChange, maxCount = 1 } = props;
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, index) => ({ uid: Date.now() + index, name: 'image.png', status: 'done', url }))
  );

  const handleChange = useCallback(({ fileList: newFileList }) => {
    setFileList(newFileList);
    onChange?.(
      newFileList.filter((file) => file.status === 'done').map((file) => file.response.url)
    );
  }, []);

  const openImgPreview = useCallback((file) => {
    let divEle = document.getElementById('domain-img-preview');
    if (!divEle) {
      divEle = document.createElement('div');
      divEle.setAttribute('id', 'domain-img-preview');
      document.body.appendChild(divEle);
    }
    const onClose = () => {
      unmountComponentAtNode(divEle as HTMLElement);
    };

    render(
      <Image
        width={0}
        height={0}
        src={file.url || file.response?.url || file.thumbUrl}
        preview={{
          src: file.url || file.response?.url || file.thumbUrl,
          visible: true,
          onVisibleChange: (visible) => {
            if (!visible) {
              onClose();
            }
          }
        }}
      />,
      divEle
    );
  }, []);
  const uploadRequestFile = useCallback((file) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('folderPath', `/imgs/${Date.now()}`);
    (window as any)
      .axios?.({
        method: 'post',
        url: '/paas/api/flow/saveFile',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => {
        if (res.data.code === 1) {
          file.onSuccess(res.data.data);
        } else {
          file.onError(new Error(res.data.msg));
        }
      })
      .catch((error) => {
        console.error(error);
        file.onError(error);
      });
  }, []);

  return (
    <Upload
      customRequest={uploadRequestFile}
      className={styles.upload}
      accept="image/*"
      listType="picture-card"
      fileList={fileList}
      maxCount={maxCount}
      onChange={handleChange}
      onPreview={openImgPreview}
    >
      {fileList.length >= maxCount ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
  );
};

export default UploadImage;

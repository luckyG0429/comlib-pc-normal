import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	Button,
	Checkbox,
	Col,
	ConfigProvider,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Radio,
	Row, Select,
	Table,
	Upload
} from 'antd';
import {ColumnsType} from 'antd/es/table';
/** 设计器中 shadow dom 导致全局 config 失效，且由于 antd 组件的默认文案是英文，所以需要修改为中文 */
import zhCN from 'antd/es/locale/zh_CN';
import DebounceSelect from "./ccomponents/debouce-select";
import {RuleMap} from "./rule";
import {ajax} from "./util";
import {ComponentName, Data, FieldBizType, ModalAction} from './constants';

import styles from './runtime.less';
import {Field} from "./type";

const INIT_PAGE = 1;
const INIT_PAGE_SIZE = 20;
export default function ({ env, data }: RuntimeParams<Data>) {
	const { edit, runtime } = env;
	const debug = !!(runtime && runtime.debug);
	if (debug || runtime) {
		data.showActionModalForEdit = '';
	}
	// const currentCreatePortal = edit || debug ? createPortal : (a => a);
	const [dataSource, setDataSource] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showModalAction, setShowModalAction] = useState('');
	const [createLoading, setCreateLoading] = useState(false);
	const [form] = Form.useForm();
	const [createForm] = Form.useForm();
	const currentData = useRef<Record<string, unknown>>({});
	const containerRef = useRef(null);
	const domainContainerRef = useRef(null);
	const searchFormValue = useRef({});
	const [pageIndex, setPageIndex] = useState(INIT_PAGE);
	const [pageSize, setPageSize] = useState<number>(data.pagination?.pageSize || INIT_PAGE_SIZE);
	const [total, setTotal] = useState(0);
	const baseFetchParams = useMemo(() => {
		return {
			serviceId: data.entity?.id,
			fileId: 318,
			// projectId: 317,
			isOnline: true
		};
	}, [data.entity]);
	
	const handleData = useCallback((query, pageInfo?: Record<string, unknown>) => {
		setLoading(true);
		const pageParams = pageInfo || { pageIndex, pageSize: edit ? 5 : pageSize };
		pageParams.pagination = data.pagination?.show;
		
		ajax({
			params: {
				query,
				fields: [{ name: 'id' }, ...data.fieldAry.filter(field => field.bizType !== FieldBizType.FRONT_CUSTOM).map(f => ({ name: f.name }))],
				page: pageParams,
				action: 'SELECT'
			},
			...baseFetchParams
		})
		.then(res => {
			if (data.pagination.show) {
				setDataSource(res.list || []);
				setTotal(res.total || 0);
			} else {
				setDataSource(res || []);
			}
		})
		.finally(() => setLoading(false));
	}, [data.fieldAry, data.pagination.show, data.entity, baseFetchParams, edit, pageIndex, pageSize]);
	
	const onDelete = useCallback((id: number) => {
		ajax({ params: { query: { id }, action: 'DELETE' }, ...baseFetchParams}, { successTip: '删除成功', errorTip: '删除失败' })
		.then(() => {
			handleData(searchFormValue.current);
		})
	}, [handleData, baseFetchParams]);
	const onEdit = useCallback((item: Record<string, unknown>) => {
		setShowModalAction(ModalAction.EDIT);
		currentData.current = item;
		const value = {};
		if (data.entity) {
			data.entity.fieldAry
				.filter(field => field.bizType !== FieldBizType.MAPPING && !field.isPrimaryKey && !field.isPrivate && !field.defaultValueWhenCreate)
				.forEach(field => {
					if (field.mapping?.entity || (field.bizType === FieldBizType.DATETIME && field.showFormat)) {
						value[field.name] = item['_' + field.name];
					} else {
						value[field.name] = item[field.name];
					}
				});
			
			createForm.setFieldsValue(value);
		}
	}, [data.entity]);
	
	const renderColumns: () => ColumnsType<any> = () => {
		return data.fieldAry ? data.fieldAry?.map(field => {
				const title = field.label || (field.mappingField ? `${field.name}.${field.mappingField.name}` : field.name);
				return field.bizType === FieldBizType.FRONT_CUSTOM ? {
					title: field.label || field.name,
					key: field.id,
					align: field.align || 'left',
					width: field.width || '100px',
					render(_, data) {
						return (
							<>
								<Button style={{ marginRight: '12px' }} size="small" onClick={() => onEdit(data)}>编辑</Button>
								<Button danger type="primary" size="small" onClick={() => onDelete(data.id)}>删除</Button>
							</>
						);
					}
				} : {
					title: title,
					dataIndex: field.mappingField ? [field.name, field.mappingField.name] : field.name,
					key: title,
					align: field.align || 'left',
					width: field.width || '100px',
				};
			}) : [];
	};
	
	useEffect(() => {
		if (!data.entity || !data.fieldAry?.length) {
			return;
		}
		handleData({});
	}, [data.entity, data.fieldAry, data.pagination.show]);
	
	const search = useCallback(() => {
		form.validateFields().then(value => {
			const curValue = {};
			
			Object.keys(value).forEach(key => {
				const filed = data.formFieldAry.find(field => field.name === key);
				let item: Record<string, unknown>= {
					operator: filed?.form?.operator ?? '=',
					value: value[key]
				};
				try {
					if (item.isAfter) {
						item.value = item.valueOf();
					}
				} catch {}
				
				curValue[key] = item;
			});
			
			setPageIndex(1);
			setPageSize(data.pagination?.pageSize || INIT_PAGE_SIZE);
			searchFormValue.current = curValue;
			handleData(curValue, { pageIndex: 1, pageSize: data.pagination?.pageSize || INIT_PAGE_SIZE });
		}).catch(_ => _);
	}, [handleData, data.formFieldAry, data.pagination?.pageSize]);
	
	const renderFormItemNode = useCallback((field: Field, option: { placeholder?: string }) => {
		let placeholder = option.placeholder ?? `请输入${field.name}`;
		let item = <Input placeholder={placeholder} />;
		
		if (field.form.formItem === ComponentName.DATE_PICKER) {
			item = <DatePicker style={{ width: '100%' }} showTime placeholder={option.placeholder ?? `请选择${field.name}`} />;
		} else if (field.form.formItem === ComponentName.INPUT_NUMBER) {
			item = <InputNumber placeholder={placeholder} />
		} else if (field.form.formItem === ComponentName.SELECT) {
			item = <Select placeholder={option.placeholder ?? `请选择${field.name}`} />
		} else if (field.mapping?.entity && field.form.formItem === ComponentName.DEBOUNCE_SELECT) {
			item = <DebounceSelect placeholder={option.placeholder ?? '可输入关键词检索'} field={field} fetchParams={baseFetchParams}/>
		} else if (field.form.formItem === ComponentName.INPUT && field.bizType === FieldBizType.PHONE) {
			item = <Input addonBefore="+86" placeholder={placeholder} />;
		} else if (field.form.formItem === ComponentName.IMAGE_UPLOAD) {
			item = <Upload />;
		} else if (field.form.formItem === ComponentName.RADIO) {
			item = <Radio.Group options={field.form?.options ?? []} />;
		} else if (field.form.formItem === ComponentName.RADIO) {
			item = <Checkbox.Group options={field.form?.options ?? []} />;
		} else if (field.bizType === FieldBizType.HREF) {
		} else if (field.bizType === FieldBizType.APPEND_FILE) {
			item = <Upload />;
		}
		
		return item;
	}, []);
	
	const renderSearchFormNode = () => {
		if (data.formFieldAry?.length) {
			return (
				<Form form={form} layout="inline" className={`${styles.form} search-form`}>
					{data.formFieldAry.map(field => {
						let placeholder: string | undefined = undefined;
						let defaultValue = undefined;
						
						if (field.form.formItem === ComponentName.INPUT || field.form.formItem === ComponentName.INPUT_NUMBER) {
							placeholder = `可输入${field.name}检索`;
						} else if (field.form.formItem === ComponentName.SELECT) {
							placeholder = `可选择${field.name}检索`;
						} else if ([ComponentName.RADIO, ComponentName.CHECKBOX, ComponentName.SELECT].includes(field.form.formItem)) {
							defaultValue = field.form?.options?.find(opt => opt.checked)?.value;
						}
						
						return (
							<div className="ant-form-item-search" data-field-id={field.id}>
								<Form.Item
									style={{ minWidth: '280px' }}
									initialValue={defaultValue}
									key={field.id}
									name={field.name}
									label={field.form?.label ?? field.name}
								>
									{renderFormItemNode(field, { placeholder })}
								</Form.Item>
							</div>
						);
					})}
					<Button type="primary" onClick={search}>查询</Button>
				</Form>
			);
		}
		
		return null;
	};
	const openCreateModal = useCallback(() => {
		setShowModalAction(ModalAction.CREATE);
		createForm.resetFields();
	}, []);
	const closeCreateModal = useCallback(() => {
		setShowModalAction('');
		data.showActionModalForEdit = '';
	}, []);
	const handleCreate = useCallback(() => {
		if (!data.entity) {
			return;
		}
		setCreateLoading(true);
		createForm
			.validateFields()
			.then(value => {
				const curValue: Record<string, unknown> = {};
				
				Object.keys(value).forEach(key => {
					let item = value[key];
					try {
						if (item.isAfter) {
							item = (item as any).valueOf();
						}
					} catch {}
					
					curValue[key] = item;
				});
				
				if (showModalAction === ModalAction.EDIT) {
					const fields = data.entity.fieldAry
					.filter(field => [FieldBizType.SYS_USER_UPDATER].includes(field.bizType) && !field.isPrimaryKey && !field.isPrivate && !field.defaultValueWhenCreate);
					
					/** 创建者默认读 window 上用户信息 */
					if (fields.length && window['LOGIN_USER_INFO']) {
						fields.forEach(field => curValue[field.name] = window['LOGIN_USER_INFO'].id);
					}
					
					curValue.id = currentData.current?.id;
				} else {
					const fields = data.entity.fieldAry
						.filter(field => [FieldBizType.SYS_USER_CREATOR, FieldBizType.SYS_USER_UPDATER].includes(field.bizType) && !field.isPrimaryKey && !field.isPrivate && !field.defaultValueWhenCreate);
					
					/** 创建者默认读 window 上用户信息 */
					if (fields.length && window['LOGIN_USER_INFO']) {
						fields.forEach(field => curValue[field.name] = window['LOGIN_USER_INFO'].id);
					}
				}
				
				fetch('/api/system/domain/run', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: undefined,
					body: JSON.stringify({
						params: {
							fields:
								showModalAction === ModalAction.CREATE
									? undefined
									: data.entity.fieldAry
										.filter(field => ![FieldBizType.MAPPING, FieldBizType.SYS_USER_CREATOR, FieldBizType.SYS_USER_UPDATER].includes(field.bizType) && !field.isPrimaryKey && !field.isPrivate && !field.defaultValueWhenCreate && !field.form.disabledForEdit),
							query: curValue,
							action: showModalAction === ModalAction.CREATE ? 'INSERT' : 'UPDATE',
						},
						...baseFetchParams
					})
				} as RequestInit)
				.then(res => res.json())
				.then(data => {
					if (data.code === 1) {
						setShowModalAction('');
						handleData(searchFormValue.current);
					}
				})
			})
			.catch(error => console.log('表单校验参数不合法', error))
			.finally(() => setCreateLoading(false));
	}, [showModalAction, data.entity, baseFetchParams]);
	const renderCreateFormNode = () => {
		if (data.entity) {
			return (
				<Row gutter={24}>
					{
						data.entity.fieldAry
							.filter(field => field.bizType !== FieldBizType.MAPPING && !field.isPrimaryKey && !field.isPrivate && !field.defaultValueWhenCreate)
							.filter(field => {
								/** 这一行必须要，读取 form 的 disabledForEdit 值才能被收集到依赖，才能对应响应编辑项变化 */
								field.form.disabledForEdit;
								/** 创建者、修改者且 window 上用户信息存在则不展示表单项 */
								if (showModalAction === ModalAction.CREATE || data.showActionModalForEdit === ModalAction.CREATE) {
									if (field.bizType === FieldBizType.SYS_USER_CREATOR || field.bizType === FieldBizType.SYS_USER_UPDATER) {
										return !window['LOGIN_USER_INFO'];
									}
								} else if (showModalAction === ModalAction.EDIT || data.showActionModalForEdit === ModalAction.EDIT) {
									/** 编辑时直接隐藏创建者对应的表单项 */
									if (field.bizType === FieldBizType.SYS_USER_CREATOR) {
										return false;
										/** 修改者且 window 上用户信息存在则不展示表单项 */
									} else if (field.bizType === FieldBizType.SYS_USER_UPDATER) {
										return !window['LOGIN_USER_INFO'];
									}
									
									return !field.form.disabledForEdit;
								}
								
								return true;
							})
							.map(field => {
								let defaultValue = undefined;
								const rules: any[] = field.form?.rules?.filter(r => r.status).map(r => RuleMap[r.key]?.(field, r)) || [];
								
								if ([ComponentName.RADIO, ComponentName.CHECKBOX, ComponentName.SELECT].includes(field.form.formItem)) {
									defaultValue = field.form?.options?.find(opt => opt.checked)?.value;
								}
								
								return (
									<Col span={12} key={field.id}>
										<div className="ant-form-item-area" style={{ width: '100%' }} data-field-id={field.id}>
											<Form.Item
												initialValue={defaultValue}
												labelCol={{ span: 6 }}
												required={field.form?.required}
												name={field.name}
												label={field.form?.label ?? field.name}
												rules={rules}
											>
												{renderFormItemNode(field, {})}
											</Form.Item>
										</div>
									</Col>
								);
							})
					}
				</Row>
			);
		}
		
		return null;
	};
	
	const onPageChange = (pageIndex: number, size: number) => {
		setPageIndex(pageIndex);
		setPageSize(size);
		handleData(searchFormValue.current, { pageIndex, pageSize: size });
	};
	
  return (
    <ConfigProvider locale={zhCN}>
	    <div className={styles.domainContainer} style={data.showActionModalForEdit ? { transform: 'translateZ(0)' } : undefined} ref={domainContainerRef}>
		    {renderSearchFormNode()}
		    <div className={styles.operateRow}>
			    <Button type="primary" onClick={openCreateModal}>新增</Button>
		    </div>
		    <Table
					loading={loading}
					columns={renderColumns()}
					dataSource={dataSource}
					pagination={data.pagination?.show ? {
						showSizeChanger: true,
						total,
						current: pageIndex,
						pageSize,
						onChange: onPageChange
					} : false}
				/>
	    </div>
	    {/*{currentCreatePortal(*/}
		  {/*  <div className={styles.container} ref={containerRef}>*/}
			{/*    <Modal*/}
			{/*	    destroyOnClose*/}
			{/*	    width={800}*/}
			{/*	    getContainer={containerRef.current && (edit || debug) ? containerRef.current : undefined}*/}
			{/*	    className={styles.createModal}*/}
			{/*	    visible={!!showModalAction || (edit && data.showActionModalForEdit)}*/}
			{/*	    title={showModalAction === ModalAction.EDIT ? '编辑' : '新增'}*/}
			{/*	    maskClosable*/}
			{/*	    closable*/}
			{/*	    onCancel={closeCreateModal}*/}
			{/*	    onOk={handleCreate}*/}
			{/*	    centered*/}
			{/*	    okText="确定"*/}
			{/*	    cancelText="取消"*/}
			{/*	    confirmLoading={createLoading}*/}
			{/*	    okButtonProps={{ loading: createLoading }}*/}
			{/*    >*/}
			{/*	    <Form form={createForm}>*/}
			{/*		    {createFormNode}*/}
			{/*	    </Form>*/}
			{/*    </Modal>*/}
		  {/*  </div>*/}
	    {/*)}*/}
	    <div className={styles.container} ref={containerRef}>
		    <Modal
			    destroyOnClose
			    width={800}
			    getContainer={((edit || debug) ? (data.showActionModalForEdit && !showModalAction ? domainContainerRef.current : document.querySelector('#_mybricks-geo-webview_')?.shadowRoot?.querySelector('div > div')) : undefined) as any}
			    className={styles.createModal}
			    visible={!!showModalAction || (edit && data.showActionModalForEdit)}
			    title={(showModalAction === ModalAction.EDIT || data.showActionModalForEdit === ModalAction.EDIT) ? '编辑' : '新增'}
			    maskClosable
			    closable
			    onCancel={closeCreateModal}
			    onOk={handleCreate}
			    centered
			    okText="确定"
			    cancelText="取消"
			    confirmLoading={createLoading}
			    okButtonProps={{ loading: createLoading }}
		    >
			    <Form form={createForm}>
				    {renderCreateFormNode()}
			    </Form>
		    </Modal>
	    </div>
    </ConfigProvider>
  );
}


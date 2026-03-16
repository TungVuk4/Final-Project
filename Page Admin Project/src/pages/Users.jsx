import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/auth";
import { getAllUsersApi, deleteUserApi } from "../services/ApiServices";
import axios from "axios";

export default function User() {
  const { t } = useTranslation();
  const toast = useRef(null);
  const token = useAuthStore((state) => state.token);

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);

  const [userProfile, setUserProfile] = useState({
    UserID: "",
    FullName: "",
    Email: "",
    Address: "",
    PhoneNumber: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsersApi(token);
      if (res.success) setUsers(res.data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: t("error"),
        detail: t("error_connection"),
      });
    } finally {
      setLoading(false);
    }
  };

  // 1. GIAO DIỆN XÓA ĐƯỢC THIẾT KẾ LẠI (SIÊU ĐẸP)
  const confirmDelete = (id) => {
    confirmDialog({
      header: t("confirm_delete_header"),
      message: (
        <div className="flex flex-col items-center p-4">
          <i className="pi pi-exclamation-circle text-red-500 text-6xl mb-4 animate-bounce"></i>
          <span className="text-center font-bold text-gray-700 text-lg">
            {t("confirm_delete_msg")}
          </span>
          <p className="text-gray-400 text-sm mt-2">
            {t("irreversible_action") || "Hành động này không thể hoàn tác"}
          </p>
        </div>
      ),
      className: "ultra-rounded-dialog delete-dialog",
      acceptLabel: t("confirm_yes"),
      rejectLabel: t("confirm_no"),
      acceptClassName:
        "bg-red-500 border-none rounded-full px-8 py-2 font-bold hover:bg-red-600 transition-all shadow-lg",
      rejectClassName:
        "p-button-text text-gray-400 font-bold px-8 hover:bg-gray-50 transition-all",
      accept: async () => {
        try {
          const res = await deleteUserApi(id, token);
          if (res.success) {
            toast.current.show({
              severity: "success",
              summary: t("success"),
              detail: "Dữ liệu đã được xóa",
            });
            loadUsers();
          }
        } catch (error) {
          toast.current.show({ severity: "error", detail: error });
        }
      },
    });
  };

  const deleteSelectedUsers = () => {
    confirmDialog({
      header: t("bulk_delete_header"),
      message: (
        <div className="flex flex-col items-center p-4">
          <i className="pi pi-trash text-red-500 text-6xl mb-4"></i>
          <span className="text-center font-black text-gray-700 text-lg">
            {t("bulk_delete_msg", { count: selectedUsers.length })}
          </span>
        </div>
      ),
      className: "ultra-rounded-dialog delete-dialog",
      acceptLabel: t("confirm_yes"),
      rejectLabel: t("confirm_no"),
      acceptClassName:
        "bg-red-500 border-none rounded-full px-8 font-bold shadow-lg",
      rejectClassName: "p-button-text text-gray-400 font-bold px-8",
      accept: async () => {
        try {
          const deletePromises = selectedUsers.map((user) =>
            deleteUserApi(user.UserID, token)
          );
          await Promise.all(deletePromises);
          toast.current.show({ severity: "success", summary: t("success") });
          setSelectedUsers(null);
          loadUsers();
        } catch (error) {
          toast.current.show({
            severity: "error",
            detail: "Lỗi xóa hàng loạt",
          });
        }
      },
    });
  };

  const openEdit = (user) => {
    setUserProfile({
      UserID: user.UserID,
      FullName: user.FullName || "",
      Email: user.Email || "",
      Address: user.Address || "",
      PhoneNumber: user.PhoneNumber || "",
    });
    setEditDialog(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/user/admin/update-profile/${userProfile.UserID}`,
        {
          FullName: userProfile.FullName,
          Address: userProfile.Address,
          PhoneNumber: userProfile.PhoneNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: t("success"),
          detail: response.data.message,
        });
        setEditDialog(false);
        loadUsers();
      }
    } catch (error) {
      toast.current.show({ severity: "error", detail: "Lỗi cập nhật server" });
    }
  };

  const nameBodyTemplate = (rowData) => (
    <div
      className="flex items-center gap-4 py-1 cursor-pointer group"
      onClick={() => openEdit(rowData)}
    >
      <Avatar
        image={`https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-${
          (rowData.UserID % 24) + 1
        }.webp`}
        shape="circle"
        size="large"
        className="group-hover:scale-110 transition-all shadow-md"
      />
      <div className="flex flex-col">
        <span className="font-bold text-[#212B36] group-hover:text-blue-600 transition-colors">
          {rowData.FullName}
        </span>
        <span className="text-[11px] text-gray-400 font-medium">
          {rowData.Email}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans animate-fade-in">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Dialog
        visible={editDialog}
        style={{ width: "500px" }}
        header={t("update_user_header")}
        modal
        className="ultra-rounded-dialog shadow-2xl overflow-hidden"
        onHide={() => setEditDialog(false)}
        footer={
          <div className="flex gap-4 justify-end p-6 bg-white">
            <span
              className="text-gray-400 font-bold cursor-pointer self-center mr-4 hover:text-gray-600 transition-colors"
              onClick={() => setEditDialog(false)}
            >
              {t("close_btn")}
            </span>
            <Button
              label={t("update_btn")}
              className="bg-[#212B36] text-white border-none rounded-[18px] px-8 py-3.5 font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              onClick={handleUpdateProfile}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-8 py-4 px-2">
          <div className="flex flex-col gap-3">
            <label className="font-black text-[11px] text-gray-400 uppercase tracking-widest ml-1">
              {t("full_name_label")}
            </label>
            <InputText
              value={userProfile.FullName}
              onChange={(e) =>
                setUserProfile({ ...userProfile, FullName: e.target.value })
              }
              className="p-4 bg-white border border-gray-100 rounded-[22px] font-bold shadow-sm focus:ring-0"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="font-black text-[11px] text-gray-400 uppercase tracking-widest ml-1">
                {t("phone_label") || "Số điện thoại"}
              </label>
              <InputText
                value={userProfile.PhoneNumber}
                onChange={(e) =>
                  setUserProfile({
                    ...userProfile,
                    PhoneNumber: e.target.value,
                  })
                }
                className="p-4 bg-white border border-gray-100 rounded-[22px] font-bold shadow-sm focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-black text-[11px] text-gray-400 uppercase tracking-widest ml-1">
                {t("address_label") || "Địa chỉ"}
              </label>
              <InputText
                value={userProfile.Address}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, Address: e.target.value })
                }
                className="p-4 bg-white border border-gray-100 rounded-[22px] font-bold shadow-sm focus:ring-0"
              />
            </div>
          </div>
        </div>
      </Dialog>

      <div className="mb-12">
        <h1 className="text-[36px] font-black text-[#212B36] tracking-tight">
          {t("users")}
        </h1>
        <p className="text-gray-400 text-sm mt-1 font-medium italic">
          {t("user_management_sub")}
        </p>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {selectedUsers && selectedUsers.length > 0 && (
          <div className="flex items-center justify-between px-10 py-5 bg-[#D1E9FF] animate-slide-down border-b border-[#D1E9FF]">
            <span className="text-[#004282] font-black text-base">
              {t("selected_count", { count: selectedUsers.length })}
            </span>
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-danger text-2xl hover:bg-red-50 rounded-full w-12 h-12 transition-all"
              onClick={deleteSelectedUsers}
            />
          </div>
        )}

        <DataTable
          value={users}
          paginator
          rows={5}
          loading={loading}
          globalFilter={globalFilter}
          header={
            <div className="p-8 bg-white">
              <div className="relative group w-full md:w-[450px]">
                <i className="pi pi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
                <InputText
                  onInput={(e) => setGlobalFilter(e.target.value)}
                  placeholder={t("search_user_placeholder")}
                  className="w-full pl-14 pr-6 py-4.5 bg-gray-50/50 border border-gray-100 rounded-[26px] focus:bg-white focus:shadow-md transition-all text-sm outline-none"
                />
              </div>
            </div>
          }
          className="custom-datatable"
          dataKey="UserID"
          responsiveLayout="scroll"
          selection={selectedUsers}
          onSelectionChange={(e) => setSelectedUsers(e.value)}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "5rem" }}
            className="pl-10"
          ></Column>
          <Column
            header={t("user_table_name")}
            body={nameBodyTemplate}
            sortable
            field="FullName"
            style={{ minWidth: "20rem" }}
          ></Column>
          <Column
            field="Role"
            header={t("user_table_role")}
            body={(rowData) => (
              <Tag
                value={
                  rowData.Role === "Admin"
                    ? t("admin_role")
                    : t("customer_role")
                }
                className={
                  rowData.Role === "Admin"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }
                style={{
                  borderRadius: "8px",
                  fontWeight: "900",
                  padding: "6px 12px",
                }}
              />
            )}
            sortable
          />
          <Column
            field="CreatedAt"
            header={t("user_table_date")}
            body={(rowData) => (
              <span className="text-gray-500 font-bold">
                {new Date(rowData.CreatedAt).toLocaleDateString()}
              </span>
            )}
            sortable
          />
          <Column
            header={t("user_table_status")}
            body={() => (
              <Tag
                value="Active"
                className="bg-green-100 text-green-700"
                style={{
                  borderRadius: "8px",
                  fontWeight: "900",
                  padding: "6px 12px",
                }}
              />
            )}
          />
          <Column
            body={(rowData) => (
              <div className="flex gap-2 justify-end pr-10">
                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger rounded-full hover:bg-red-50 w-10 h-10 transition-all"
                  onClick={() => confirmDelete(rowData.UserID)}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <style jsx="true">{`
        :global(.ultra-rounded-dialog) {
          border-radius: 45px !important;
          border: none !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        :global(.ultra-rounded-dialog .p-dialog-header) {
          border-radius: 45px 45px 0 0 !important;
          padding: 3rem 3rem 1rem 3rem !important;
        }
        :global(.ultra-rounded-dialog .p-dialog-content) {
          padding: 1rem 3rem 2.5rem 3rem !important;
        }
        :global(.ultra-rounded-dialog .p-dialog-footer) {
          border-radius: 0 0 45px 45px !important;
          border: none !important;
          padding: 0 3rem 3rem 3rem !important;
        }

        /* HIỆU ỨNG RIÊNG CHO HỘP THOẠI XÓA */
        :global(.delete-dialog .p-dialog-header) {
          color: #ef4444 !important;
        }

        .p-dialog-mask {
          backdrop-filter: blur(12px);
          background: rgba(33, 43, 54, 0.5) !important;
        }
        .custom-datatable .p-datatable-thead > tr > th {
          background-color: #f4f6f8 !important;
          color: #637381 !important;
          font-weight: 900;
          font-size: 12px;
          padding: 1.8rem 1rem;
          border: none;
          text-transform: uppercase;
        }
        .p-paginator {
          border: none !important;
          padding: 2.5rem !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

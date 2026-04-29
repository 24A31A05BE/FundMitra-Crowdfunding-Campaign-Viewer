/* ============================================================
   newcampaign.js
   Depends on: dashboard.js (uses `DEFAULT_IMAGE`, `showToast`,
   `showActionTooltip` from that file)
   ============================================================ */

/* OPEN CREATE MODAL */
function createCampaign() {
    localStorage.removeItem("editingCampaignId");
    document.getElementById("campaignModal").style.display = "flex";
}

/* CLOSE CREATE/EDIT MODAL */
function closeModal() {
    document.getElementById("campaignModal").style.display = "none";
    localStorage.removeItem("editingCampaignId");
}

/* SUBMIT — handles both create and edit */
document.getElementById("campaignForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const existing   = JSON.parse(localStorage.getItem("userCampaigns")) || [];
    const editingId  = localStorage.getItem("editingCampaignId");

    const shortDesc    = document.getElementById("shortDescription").value;
    const fullDescInput = document.getElementById("fullDescription").value;
    const imageInput   = document.getElementById("image").value;

    if (editingId) {
        const index = existing.findIndex(c => c.id == editingId);

        existing[index] = {
            ...existing[index],
            title:            document.getElementById("title").value,
            category:         document.getElementById("category").value,
            shortDescription: shortDesc,
            fullDescription:  fullDescInput ? fullDescInput : shortDesc,
            image:            imageInput ? imageInput : DEFAULT_IMAGE,
            goalAmount:       Number(document.getElementById("goalAmount").value),
            daysLeft:         Number(document.getElementById("duration").value)
        };

    } else {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));

        const newCampaign = {
            id:               Date.now(),
            title:            document.getElementById("title").value,
            category:         document.getElementById("category").value,
            shortDescription: shortDesc,
            fullDescription:  fullDescInput ? fullDescInput : shortDesc,
            image:            imageInput ? imageInput : DEFAULT_IMAGE,
            goalAmount:       Number(document.getElementById("goalAmount").value),
            raisedAmount:     0,
            backers:          0,
            daysLeft:         Number(document.getElementById("duration").value),
            creatorName:      user.name,
            tags:             [],
            recentBackers:    [],
            comments:         [],
            updates:          []
        };

        existing.push(newCampaign);
        localStorage.setItem("showToast", "Campaign created successfully");
    }

    localStorage.setItem("userCampaigns", JSON.stringify(existing));
    localStorage.removeItem("editingCampaignId");
    closeModal();
    window.location.reload();
});

/* EDIT */
function editCampaign(id, isUser, event) {
    if (!isUser) {
        showActionTooltip(event.target, "Demo campaign cannot be edited");
        return;
    }

    const userCampaigns = JSON.parse(localStorage.getItem("userCampaigns")) || [];
    const campaign = userCampaigns.find(c => c.id === id);

    document.getElementById("title").value            = campaign.title;
    document.getElementById("category").value         = campaign.category;
    document.getElementById("shortDescription").value = campaign.shortDescription;
    document.getElementById("fullDescription").value  = campaign.fullDescription || "";
    document.getElementById("image").value            = campaign.image || "";
    document.getElementById("goalAmount").value       = campaign.goalAmount;
    document.getElementById("duration").value         = campaign.daysLeft;

    localStorage.setItem("editingCampaignId", id);
    document.getElementById("campaignModal").style.display = "flex";
}

/* DELETE — with confirm modal */
let deleteId = null;

function deleteCampaign(id, isUser, event) {
    if (!isUser) {
        showActionTooltip(event.target, "Demo campaign cannot be deleted");
        return;
    }

    deleteId = id;
    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}

document.getElementById("confirmDelete").addEventListener("click", function() {
    let userCampaigns = JSON.parse(localStorage.getItem("userCampaigns")) || [];
    userCampaigns = userCampaigns.filter(c => c.id !== deleteId);

    localStorage.setItem("userCampaigns", JSON.stringify(userCampaigns));
    localStorage.setItem("showToast", "Campaign deleted successfully");

    closeDeleteModal();
    window.location.reload();
});
